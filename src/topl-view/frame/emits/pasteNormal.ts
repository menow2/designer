/**
 * XGraph Opensource
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * Mail:chemingjun@126.com Wechat:ALJZJZ
 */

import FrameModel from "../FrameModel";
import {ToplComModel} from "../../com/ToplComModel";
import {PinModel} from "../../pin/PinModel";
import {ComSeedModel} from "@sdk";
import {ConModel} from "../../con/ConModel";
import {alignToCanvasGrid} from "../../ToplUtil";
import {Arrays} from "@utils";
import {ToplViewContext} from "../ToplView";

let tvContext: ToplViewContext
let COM_ID_MAPS
let drawCons

let pasteModule: boolean = false

export default function pasteNormal(json, _tvContext: ToplViewContext): boolean {
  tvContext = _tvContext
  COM_ID_MAPS = json['_COM_ID_MAPS']
  drawCons = []

  const comBaseModel = json['_baseModel'] as ComSeedModel
  //pasteModule = comBaseModel.runtime.def.namespace === NS_XGraphComLib.coms.module

  const nmodel = genTopl(json, _tvContext.frameModel, true)

  drawCons.forEach(fn => fn(nmodel))

  if (_tvContext.frameModel.state.isEnabled()) {
    setTimeout(v => {
      _tvContext.emitItem.focus(nmodel)
    })
  }

  return nmodel.id
}

function genTopl(json, frameModel: FrameModel, topOne?): ToplComModel {
  const refs: { proxyPins: { pin: PinModel, proxy: { id: string } }[] } = {
    proxyPins: []
  }

  const comBaseModel = json['_baseModel'] as ComSeedModel
  //const comDef = context.getComDef(comBaseModel.runtime.def)

  let nmodel: ToplComModel

  const fromDesc = json['_from_']

  nmodel = createToplCom()

  function createToplCom() {
    const nmodel: ToplComModel = new ToplComModel(comBaseModel)

    nmodel.runtime.title = json.title

    doFrames(json, nmodel, refs)
    doToplProps(json, nmodel, refs)

    nmodel.parent = frameModel
    nmodel.runtime.topl = nmodel

    if (topOne) {
      nmodel.style.left = alignToCanvasGrid(100 + Math.random() * 100)
      nmodel.style.top = alignToCanvasGrid(100 + Math.random() * 100)
    }

    frameModel.addComponent(nmodel)

    refs.proxyPins.forEach(({pin, proxy}) => {
      if (pin.isDirectionOfInput()) {
        let ppin = Arrays.find(pin => pin.id === proxy.id, ...nmodel.getInputsAll())
        if (!ppin) {
          if (nmodel.frames) {
            nmodel.frames.find(frame => {
              if (ppin = frame.inputPins.find(pin => pin.id === proxy.id)) {
                return true
              }
            })
          }
        }
        if (!ppin) {
          throw new Error(`未找到proxyPin,复制失败.`)
        }
        pin.proxyPin = ppin
      } else {
        let ppin = Arrays.find(pin => pin.id === proxy.id, ...nmodel.getOutputsAll())
        if (!ppin) {
          if (nmodel.frames) {
            nmodel.frames.find(frame => {
              if (ppin = frame.outputPins.find(pin => pin.id === proxy.id)) {
                return true
              }
            })
          }
        }
        if (!ppin) {
          throw new Error(`未找到proxyPin,复制失败.`)
        }
        pin.proxyPin = ppin
      }
    })
    return nmodel
  }

  return nmodel
}


export function doToplProps(json, gmodel: ToplComModel, refs) {
  const toplJson = json['topl']

// console.log(gmodel.runtime.def.namespace)
//   if(gmodel.runtime.def.namespace.endsWith('toolbar')){
//     debugger
//   }

  if (toplJson) {
    if (Array.isArray(toplJson.inputPinsInModel)) {
      toplJson.inputPinsInModel.forEach(pin => {
        //const pinModel = gmodel.addInputPinInModel(pin.hostId, pin.title, pin.schema,pin.deletable)///TODO recover
        const pinModel = gmodel.addInputPinInModel(pin.hostId, pin.title, pin.schema, true)
        if (pinModel) {
          pinModel.id = pin.id

          if (pin.proxyPin) {
            refs.proxyPins.push({pin: pinModel, proxy: pin.proxyPin})
          }
        }
      })
    }
    if (Array.isArray(toplJson.outputPinsInModel)) {
      toplJson.outputPinsInModel.forEach(pin => {

        const comBaseModel = json['_baseModel'] as ComSeedModel

        // if(comBaseModel.runtime.def.namespace.endsWith('toolbar')){
        //   debugger
        // }

        //const pinModel = gmodel.addOutputPinInModel(pin.hostId, pin.title, pin.schema,pin.deletable)///TODO recover
        const pinModel = gmodel.addOutputPinInModel(pin.hostId, pin.title, pin.schema, true)
        if (pinModel) {
          pinModel.id = pin.id

          if (pin.proxyPin) {
            refs.proxyPins.push({pin: pinModel, proxy: pin.proxyPin})
          }
        }
      })
    }

    if (Array.isArray(toplJson.inputPins)) {
      toplJson.inputPins.forEach(pin => {
        const pinModel = gmodel.addInputPin(pin.hostId, pin.title, pin.schema)
        pinModel.id = pin.id

        if (pin.proxyPin) {
          refs.proxyPins.push({pin: pinModel, proxy: pin.proxyPin})
        }
      })
    }
    if (Array.isArray(toplJson.outputPins)) {
      toplJson.outputPins.forEach(pin => {
        const pinModel = gmodel.addOutputPin(pin.hostId, pin.title, pin.schema)
        pinModel.id = pin.id

        if (pin.proxyPin) {
          refs.proxyPins.push({pin: pinModel, proxy: pin.proxyPin})
        }
      })
    }

    if (Array.isArray(toplJson.inputPinExts)) {
      toplJson.inputPinExts.forEach(pin => {
        const pinModel = gmodel.addInputPinExt(pin.hostId, pin.title, pin.schema)
        pinModel.id = pin.id
      })
    }
    if (Array.isArray(toplJson.outputPinExts)) {
      toplJson.outputPinExts.forEach(pin => {
        const pinModel = gmodel.addOutputPinExt(pin.hostId, pin.title, pin.schema)
        pinModel.id = pin.id
      })
    }

    if (toplJson.style) {
      for (let key in toplJson.style) {
        gmodel.style[key] = toplJson.style[key]
      }
    }
  }
}

function doFrames(json, gmodel: ToplComModel, refs) {
  if (json.topl && json.topl.frames) {
    let framesJson = json.topl.frames

    gmodel.frames = []
    framesJson.forEach(frameJson => {
      if (frameJson.type !== 'scope') {
        if (Array.isArray(frameJson.comAry)) {
          frameJson.comAry.forEach(json => {
            genTopl(json, tvContext.frameModel)
          })
        }
        return
      }

      const frame = gmodel.addFrame(frameJson.id, frameJson.title, frameJson.name, frameJson._rootF)
      frame.type = 'scope'

      if (frameJson.style) {
        for (let key in frameJson.style) {
          frame.style[key] = frameJson.style[key]
        }
      }

      if (Array.isArray(frameJson.comAry)) {
        frameJson.comAry.forEach(json => {
          genTopl(json, frame)
        })
      }

      if (Array.isArray(frameJson.inputPins)) {
        frameJson.inputPins.forEach(pin => {
          const pinModel = frame.addInputPin(pin.hostId, pin.title, pin.schema, pin.conMax, pin.deletable)
          pinModel.id = pin.id

          if (pin.proxyPin) {
            refs.proxyPins.push({pin: pinModel, proxy: pin.proxyPin})
          }
        })
      }

      if (Array.isArray(frameJson.outputPins)) {
        frameJson.outputPins.forEach(pin => {
          const pinModel = frame.addOutputPin(pin.hostId, pin.title, pin.schema, pin.conMax, pin.deletable)
          pinModel.id = pin.id

          if (pin.proxyPin) {
            refs.proxyPins.push({pin: pinModel, proxy: pin.proxyPin})
          }
        })
      }
      if (Array.isArray(frameJson.conAry)) {
        drawCons.push((rootCom: ToplComModel) => {
          frameJson.conAry.forEach(con => {
            const {from, to, _points, _startPo, _finishPo, errorInfo} = con

            const {type: fromType, parent: fromParent} = from
            const {type: toType, parent: toParent} = to

            const conTitle = `从${fromParent.comNS}|${from.title || '未知端口'} 到 ${toParent.comNS}|${to.title || '未知端口'} 的连接`

            let fromCom, toCom
            try {
              let nowId = COM_ID_MAPS[fromParent.comId]
              if (nowId) {
                fromCom = rootCom.searchCom(nowId)
                if (!fromCom) {
                  throw new Error(`${conTitle},组件(id=${nowId},namespace=${fromParent.comNS})未找到.`)
                }
              } else {
                throw new Error(`${conTitle},组件(id=${fromParent.comId},namespace=${fromParent.comNS})未找到.`)
              }

              nowId = COM_ID_MAPS[toParent.comId]
              if (nowId) {
                toCom = rootCom.searchCom(nowId)
                if (!toCom) {
                  throw new Error(`${conTitle},组件(id=${nowId},namespace=${toParent.comNS})未找到.`)
                }
              } else {
                throw new Error(`${conTitle},组件(id=${toParent.comId},namespace=${toParent.comNS})未找到.`)
              }
            } catch (ex) {
              tvContext.emitLogs.error(ex.message)
            }

            if (!fromCom || !toCom) {
              return
            }

            let startPin: PinModel
            if (fromType === 'pin') {
              if (fromParent.type === 'com') {
                startPin = fromCom.searchPin(from.id)
              } else {
                const frameT = fromCom.searchFrame(fromParent.id)
                if (!frameT) {
                  throw new Error(`未找到frame(id=${fromParent.id})`)
                } else {
                  startPin = frameT.searchPin(from.id)
                }
              }
            }

            let finishPin: PinModel

            if (toType === 'pin') {
              if (toParent.type === 'com') {
                finishPin = toCom.searchPin(to.id)
              } else {
                const frameT = toCom.searchFrame(toParent.id)
                if (!frameT) {
                  throw new Error(`未找到frame(id=${toParent.id})`)
                } else {
                  finishPin = frameT.searchPin(to.id)
                }
              }
            }

            if (startPin && finishPin) {
              const conModel = new ConModel({startPin, finishPin, _points, _startPo, _finishPo, errorInfo})
              conModel.parent = frame

              if (startPin instanceof PinModel) {
                startPin.addCon(conModel)
              } else {
                startPin.to = conModel
              }

              if (finishPin instanceof PinModel) {
                finishPin.addCon(conModel)
              } else {
                finishPin.from = conModel
              }

              frame.addConnection(conModel)
            } else {
              debugger
            }
          })
        })
      }

    })
  }
}