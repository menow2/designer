/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * MyBricks team @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */

import {ToplViewContext} from "./frame/ToplView";
import {PinModel} from "./pin/PinModel";
import {compile, createIO, I_Frame, I_Joint, I_Node, I_Pin, I_Runner} from "@mybricks/compiler-js";
import {exeStepTime, PinExtInputs} from "./config";
import ToplViewModel from "./frame/ToplViewModel";
import {ToplComModel} from "./com/ToplComModel";
import {DesignerContext, NS_Emits} from "@sdk";
import {igonreObservableBefore, clone} from "rxui";
import FrameModel from "./frame/FrameModel";

let runner: I_Runner;

export function run(frame: I_Frame, {context, frameModel}: ToplViewContext,
                    emitDebug: NS_Emits.Debug,
                    emitLogs: NS_Emits.Logs,
                    state: 'start' | 'pause' | 'stop',
                    mockModeF?: boolean) {
  //const cfg = context.viewConfigs['toplView']
  let cfg

  function stop() {
    frameModel.blur()

    runner && runner.stop()
    runner = void 0
  }

  switch (state) {
    case 'start': {
      if (runner) {
        const pipeIn = runner.run(frame, {
          debug: {
            stepTime: cfg && cfg['debug'] && cfg['debug']['stepSleepTime'] || exeStepTime
          }
        })
        pipeIn()
      } else {
        emitLogs.warn('开始调试...')

        frameModel.blur()
        NodeDebug.init(emitDebug, context)
        PinDebug.init(frameModel, emitLogs)

        let debugTarget
        if (cfg && cfg['debug'] && typeof (debugTarget = cfg['debug']['target']) == 'function') {
          debugTarget(({type, id, value}) => {
            let item = searchItem(frameModel, id)
            if (item instanceof PinModel) {
              PinDebug.fn(item).exe(value, void 0)
            }
          })
        } else {
          // const envVars = {
          //   getUserToken() {
          //     return context.envVars.debug.userToken;
          //   },
          //   getEnvType() {
          //     return context.envVars.debug.envType;
          //   },
          //   getEnvParam(name) {
          //     const params = context.envVars.debug.envParams
          //     if (typeof params === 'string') {
          //       return JSON.parse(params)[name]
          //     }
          //   }
          // }

          try {
            runner = compile(frameModel, {
              node: NodeDebug.fn,
              pin: PinDebug.fn,
              // envVars,
              // extComDef: context.configs.extComDef
            }, mockModeF ? 'mock' : void 0)

            emitLogs.warn(`编译完成.`)
          } catch (ex) {
            emitLogs.info(`编译失败:${ex.message}`)
          }

          try {
            const pipeIn = runner.run(frame, {
              debug: {
                stepTime: cfg && cfg['debug'] && cfg['debug']['stepSleepTime'] || exeStepTime
              }
            })
            pipeIn()
          } catch (ex) {
            stop()

            emitLogs.error(`运行失败:${ex.message}<br/>${ex.stack.replaceAll('\n', '<br/>').replaceAll('<anonymous>', '')}`)
            console.error(ex)
            emitLogs.warn(`调试停止.`)
          }
        }
      }
      break;
    }
    case 'pause': {
      runner && runner.pause()
      emitLogs.warn(`调试暂停.`)
      break;
    }
    case 'stop': {
      stop()
      //emitLogs.warn(`调试停止.`)
      break;
    }
  }
}

export function stopRunner({frameModel, emitLogs,emitDebug}: ToplViewContext,) {
  if (runner) {
    runner.stop()
    runner = void 0
  }
}

export function stop({frameModel, emitLogs,emitDebug}: ToplViewContext,) {
  if (runner) {
    runner.stop()
    emitDebug.stop()
    runner = void 0
    //emitLogs.warn(`调试停止.`)
  }
}

const PinDebug = (function () {
  let emitLogs: NS_Emits.Logs
  let viewModel: ToplViewModel
  return {
    init(model, _emitLogs: NS_Emits.Logs) {
      viewModel = model
      emitLogs = _emitLogs
    },
    fn(pin: I_Pin) {
      let pinModel: PinModel = pin as PinModel

      const com: ToplComModel = pinModel.parent instanceof ToplComModel ? pinModel.parent : pinModel.parent.parent
      return {
        exe(val: any, from, directionTitle?) {
          pinModel.exe = {val, from}
          pinModel.state.running()

          // if(pinModel.forkedTo){
          //   pinModel.forkedTo.forEach(pin=>{
          //     debugger
          //     pin.exeValue = value
          //     pin.state.running()
          //   })
          // }

          // if (pinModel.direction == 'input' || pinModel.direction == 'inner-input') {
          //   pinModel.conAry.forEach(con => {
          //     con.state.runningRecover()
          //   })
          // } else {
          //   pinModel.conAry.forEach(con => con.state.running())
          // }

          const strVal = typeof val === 'object' && val ?
            JSON.stringify(val) :
            String(val)

          directionTitle = directionTitle || (pinModel.direction == 'input' || pinModel.direction == 'inner-input' ? '传入' : '传出')

          emitLogs.info('程序运行', `${com.runtime.title} | ${pinModel.title} ${directionTitle} ${strVal}`,
            () => {
              pinModel.hoverExeval(val, from)
            },
            () => {
              pinModel.clearDebugHints()
            }
          )

          // logs.push({
          //   id: uuid(),
          //   hostId: pinModel.hostId,
          //   time: new Date(),
          //   type: 'normal',
          //   content: logContent,
          //   focus() {
          //     viewModel.blur()
          //     pinModel.hoverExeval(value)
          //   }
          // })

          if (pinModel.isTypeOfExt()) {
            if (pinModel.isDirectionOfInput()) {
              const def = PinExtInputs.find(def => def.hostId === pinModel.hostId)
              if (def) {
                def.exe(pinModel)
              }
            }
            return false
          }
        }
      }
    }
  }
})()

const NodeDebug = (function () {
  let context: DesignerContext
  let emitDebug: NS_Emits.Debug

  let envRuntime

  function getEnvRuntime(model: ToplComModel,curScope) {
    if (!envRuntime) {
      envRuntime = Object.assign({
        debug: {},
        getUserToken() {
          return context.envVars.debug.userToken;
        },
        getEnvType() {
          return context.envVars.debug.envType;
        },
        getEnvParam(name) {
          const params = context.envVars.debug.envParams
          if (typeof params === 'string') {
            return JSON.parse(params)[name]
          }
        }
      }, context.configs.envAppenders?.runtime)
    }
    return {
      runtime: Object.assign({
        get curModule() {
          const module = model.parent.parent
          if (module) {
            const frame = model.parent as FrameModel
            const outPins = frame.outputPins
            const outputs = {}

            outPins.forEach(pin => {
              outputs[pin.id] = (val, callback) => {
                pin._exe(curScope,val,callback)
              }
            })
            return {
              outputs
            }
          }
        }
      }, envRuntime)
    }
  }

  return {
    init(debugMode: NS_Emits.Debug, _context: DesignerContext) {
      context = _context
      emitDebug = debugMode
    },
    fn(model: ToplComModel) {
      return {
        render(scopePath: string, frameLable: string, frames: {},curScope) {
          const {inputs, outputs} = createIO(model, {
            output() {
              igonreObservableBefore()
            }
          })

          let runtime
          //if (!context.useLatestFeatures || !model.runtime.def.extension) {
// if(model.runtime.def.namespace.endsWith('button-normal')){
//   debugger
// }
          if (model.runtime.hasUI()) {
            //try {
            runtime = emitDebug.setComDebug(scopePath, frameLable, model.id, {
              inputs,
              outputs,
              frames
            }, model.runtime.def) //Get runnable instance

            // } catch (ex) {
            //   debugger
            // }
          } else {//js component
            const comDef = context.getComDef(model.runtime.def)
            comDef.runtime({
              data: clone(model.runtime.model.data),
              inputs,
              outputs,
              env: getEnvRuntime(model,curScope)
            })
          }

          model.setDebug(frameLable, {runtime, inputs, outputs})
          return {inputs, outputs}
        },
        exe({inputs, outputs}, params: { [index: string]: any }, callback: Function) {

        }
      }
    }
  }
})()


const searchItem = (function () {
  let sid: string

  function inArys(...arys) {
    let rst
    arys.find(ary => {
      ary && ary.find(item => {
        if (item.id === sid) {
          rst = item
        }
      })
      return rst
    })
    return rst
  }

  function inNode(node: I_Node) {
    if (node.id === sid) {
      return node
    }
    let rst = inArys(node.inputPins, node.outputPins)
    if (rst) {
      return rst
    }
    if (node.frames) {
      node.frames.find((frame: I_Frame) => {
        rst = inFrame(frame)
        return rst
      })
    }
    return rst
  }

  function inFrame(frame: I_Frame) {
    if (frame.id === sid) {
      return frame
    }
    let rst = inArys(frame.inputPins, frame.outputPins, frame.inputJoints, frame.outputJoints)
    if (rst) {
      return rst
    }
    if (frame.comAry) {
      frame.comAry.find((node: I_Node) => {
        rst = inNode(node)
        return rst
      })
    }
    return rst
  }

  return function (frame: I_Frame, id: string) {
    sid = id
    return inFrame(frame)
  }
})()