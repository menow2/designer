/**
 * XGraph Opensource
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * Mail:chemingjun@126.com Wechat:ALJZJZ
 */

import {GeoViewContext} from "./GeoView";
import {BaseModel, ComSeedModel, T_ComDef, ModuleSeedModel} from "@sdk";
import {getPosition} from "@utils";
import {GeoComModel} from "../com/GeoComModel";
import SlotModel from "./SlotModel";

export function validate({viewModel, emitLogs}: GeoViewContext) {
  //if duplicate ID
  // const rt = model.runtime
  // const exist: GeoComModel = COM_IDS[model.id]
  // if (exist) {
  //   emitLogs.error('数据错误', `布局视图中的重复组件ID:(${exist.runtime.title},namespace=${exist.runtime.def.namespace},id=${model.id}) 与 (${rt.title},namespace=${rt.def.namespace},id=${model.id})`)
  // }
  // COM_IDS[model.id] = model
}

export function getEmitItem(viewCtx: GeoViewContext) {
  const {viewModel, mover, emitSnap, emitLogs, emitItem, context} = viewCtx

  return {
    exist(def: T_ComDef, instId: string): { id: string, result: boolean, info: string } {
      const comModel = viewModel.searchCom(instId)
      if (comModel !== void 0) {
        return {id: instId, result: true, info: void 0}
      } else {
        emitLogs.error('数据错误', `组件(namespace=${def.namespace},id=${instId})在布局视图中不存在.`)
        return {id: instId, result: false, info: `组件在布局视图中不存在.`}
      }
    },
    add(instanceModel: ComSeedModel, state) {//Add component
      if (instanceModel instanceof GeoComModel) {
        return
      }
      if (state === 'ing') {
        const style = instanceModel.runtime.model.style
        if (style) {
          const vpo = getPosition(viewModel.$el)

          mover.show({x: style.left - vpo.x, y: style.top - vpo.y})
        }

        searchPlaceholder(instanceModel, viewCtx, mover)
      } else if (state === 'finish') {
        mover.hide()

        const gmodel = new GeoComModel(instanceModel)
        gmodel.parent = viewModel

        const comDef = context.getComDef(gmodel.runtime.def)

        if (comDef.slots && comDef.slots.length > 0) {
          if (instanceModel instanceof ModuleSeedModel && instanceModel.slot) {//Add module,with opts:{slot,frame}
            const slotDef = comDef.slots[0]

            const slot = instanceModel.slot as SlotModel

            slot.id = slotDef.id
            slot.name = void 0
            slot._rootF = true
            gmodel.slots = [slot]
          } else {
            comDef.slots.forEach(({id, title}) => {
              gmodel.addSlot(id, title)
            })
          }
        }

        if (viewCtx.placeholder && viewCtx.placeholder.index !== void 0) {
          const rtn = {insertOrder: viewCtx.placeholder.index}
          viewCtx.placeholder.y = void 0
          viewCtx.placeholder.index = void 0

          if (rtn.insertOrder !== void 0) {
            viewModel.insertInto(gmodel, rtn.insertOrder)
          }
        } else {
          // gmodel.style.left = 100 + Math.random() * 100
          // gmodel.style.top = 100 + Math.random() * 100

          viewModel.addComponent(gmodel)
        }

        if (context.isDebugMode()) {
          viewModel.addDebugTempCom(gmodel)
        } else {
          if (viewModel.state.isEnabled()) {
            emitItem.focus(gmodel)
          }
        }

        return gmodel.runtime.id
      }
    },
    addSlot(comId: string, slotId: string, slotTitle?: string): boolean {
      const com = viewModel.searchCom(comId)
      com.addSlot(slotId, slotTitle)
      return true
    },
    setSlotTitle(comId: string, slotId: string, slotTitle: string): boolean {
      const com = viewModel.searchCom(comId)
      com.getSlot(slotId).title = slotTitle
      return true
    },
    removeSlot(comId: string, slotId: string) {
      const com: GeoComModel = viewModel.searchCom(comId)
      com.removeSlot(slotId)
      return true
    },
    // focus(model: BaseModel) {
    //   if (context.isDebugMode() || viewModel.state.isDisabled()) {
    //     return
    //   }
    //   if (!model || model instanceof SlotModel || !(model instanceof GeoComModel)) {
    //     viewModel.blur()
    //     return
    //   }
    //
    //   if (viewModel.focusModelAry && viewModel.focusModelAry.indexOf(model) !== -1) {
    //     return
    //   } else {
    //     viewModel.focusItem(model)
    //     return
    //   }
    // },
    // reFocus(model: BaseModel): boolean {
    //   emitItem.reFocus(model)
    //   return
    //
    //   if (reFocusLock) {
    //     return
    //   }
    //   console.log(Math.random())
    //   if(model){
    //     reFocusLock = model
    //     emitItem.focus(model)
    //   }else{
    //     if(context.focusModelAry.length===1){
    //       const fmodel = context.focusModelAry[0]
    //       if(fmodel instanceof GeoComModel){
    //
    //         reFocusLock = fmodel
    //
    //         const oriFa = fmodel.focusArea
    //
    //         context.blur()
    //
    //         fmodel.focusArea = oriFa
    //         emitItem.focus(fmodel)
    //       }
    //     }
    //   }
    //
    //   reFocusLock = void 0
    //
    //   //emitItem.focus(model)
    //   return
    //
    //   ////TODO
    //
    //   if (reFocusLock) {
    //     return
    //   }
    //   try {
    //     let fm: GeoComModel
    //     const oriAry = viewModel.focusModelAry
    //     if (model) {
    //       fm = model as GeoComModel
    //     } else if (oriAry.length === 1) {
    //       fm = oriAry[0] as GeoComModel
    //     }
    //     if (fm) {
    //       reFocusLock = fm
    //
    //       const oriFa = fm.focusArea
    //       viewModel.blur()
    //
    //       fm.focusArea = oriFa
    //
    //       if (model) {
    //         emitItem.focus(fm)
    //       } else {
    //         viewModel.focusItem(fm)
    //       }
    //
    //       //setTimeout(v=>{
    //       //emitItem.focus(fm)
    //       //})
    //     }
    //   } finally {
    //     reFocusLock = void 0
    //   }
    // },
    focusFork(model: BaseModel): boolean {
      if (!model) return
      if (model instanceof GeoComModel) {
        viewModel.state.disable();//Hide cur view
        return false;
      }
      viewModel.state.enable();//Focus cur view
      if (context.isDebugMode()) {
        return false;
      }
      let geoModel = viewModel.searchCom(model.id)
      if (geoModel) {
        emitItem.focus(geoModel)
        return true;
      }
    },
    hover(model: BaseModel) {
      if (context.isDebugMode()) {
        return;
      }
      if (model == null) {
        viewCtx.hoverModel = void 0
        return;
      }
      if (viewModel.state.isEnabled() && model instanceof GeoComModel && !model.state.isFocused()) {
        if (!viewCtx.hoverModel || viewCtx.hoverModel.id !== model.id) {
          viewCtx.hoverModel = model
        }
      }
    },
    move(model: BaseModel, state: 'start' | 'ing' | 'finish', position?: { x: number, y: number }, suggest?: Function) {
      // if (state == 'start') {
      //   viewModel.focusModelAry = [model];
      //   return;
      // }

      if (model instanceof GeoComModel) {
        if (!model.style.isLayoutAbsolute()) {
          if (state == 'ing') {
            if (position) {
              mover.show(position)
            }
            searchPlaceholder(model, viewCtx, mover)
          } else if (state == 'finish') {
            mover.hide()
            if (viewCtx.config?.overflowY == 'auto') {
              //this.$refs['wrapView'].style.height = 'auto';//Reset height
            }
            if (viewCtx.placeholder) {
              const rtn = {insertOrder: viewCtx.placeholder.index}
              viewCtx.placeholder.y = undefined
              viewCtx.placeholder.index = undefined

              return rtn
            }
          }
        }
      }
      if (state == 'ing') {
        viewCtx.hoverModel = void 0
        //model['_mvFn'] = fn;//Temp
      } else if (state == 'finish') {
        //model['_mvFn'] = undefined
      }
    },
    cutToSlot: (fromComId: string, toComId: string, toSlotId: string, order?: number): boolean => {
      const model: GeoComModel = viewModel.searchCom(fromComId),
        randomPo = order !== void 0 ? order : false;
      if (!model) {
        return;
      }

      if (toComId == null) {//Root
        viewModel.cutIn(model, randomPo)
      } else {
        const toCom = viewModel.searchCom(toComId)
        //if (toCom) {
        toCom.cutIn(model, toSlotId, randomPo)
        //}
      }
    },
    paste(json): string {
      function genGeo(myJson, slotModel: SlotModel): GeoComModel {
        const nmodel = new GeoComModel(myJson['_baseModel'])

        nmodel.parent = slotModel
        nmodel.runtime.title = myJson.title

        nmodel.runtime.geo = nmodel

        slotModel.addComponent(nmodel)

        if (myJson.geo && Array.isArray(myJson.geo.slots)) {
          myJson.geo.slots.forEach(slot => {
            const slotModel = nmodel.addSlot(slot.id, slot.title, slot._rootF, slot.type)
            if (Array.isArray(slot.comAry)) {
              slot.comAry.forEach(json => {
                const nmodel = genGeo(json, slotModel)
                if (slotModel.type !== 'scope') {
                  //emitItem.add(nmodel, 'finish')//Emit to add in toplView
                  emitItem.add(nmodel, 'finish', {json: json})//Emit to add in toplView,with json in topl
                }
              })
            }
          })
        }

        return nmodel
      }

      if (json['_from_'] && json['_from_'].type === 'comInDiagram') {
        return
      }

      const gmodel = genGeo(json, viewModel)

      if (viewModel.state.isEnabled()) {
        setTimeout(v => {
          emitItem.focus(gmodel)
        })
      }

      return gmodel.id
    },
    delete: (model: BaseModel): boolean => {
      if (model instanceof ComSeedModel) {
        if (model.forkedFrom) {
          return
        }
        const target = viewModel.searchCom(model.id)
        if (!target) {
          console.warn(`Component(id=${model.id},namespace=${model?.runtime.def?.namespace}) in GeoView not found.`)
          return false
        } else {
          const delInSlot = slot => {
            let count = 0, max = slot.comAry.length * 2
            while (slot.comAry.length) {
              emitItem.delete(slot.comAry[0])
              if (count++ >= max) {
                break
              }
            }
            // slot.comAry.forEach(item => {
            //   emitItem.delete(item)
            // })
          }
          if (target.slots) {
            target.slots.forEach(slot => delInSlot(slot))
          }

          target.parent.delete(target)
          return true
        }
      }
    },
    editDiagram(comId: string, outputId?: string) {
      viewModel.state.disable()
    },
  }
}

export function getOutliners({viewModel, context, emitItem}: GeoViewContext) {
  let fn = (slotModel: SlotModel, parent?) => {
    let rtn = [];
    if (slotModel.comAry) {
      slotModel.comAry.forEach((model: GeoComModel) => {
        if (!(model instanceof GeoComModel)) {
          return
        }
        const def = context.getComDef(model.runtime.def)
        if (def) {
          if (model.runtime.hasUI()) {
            rtn.push({
              id: model.id,
              get icon() {
                return def.icon
              },
              get title() {
                return model.runtime.title || def.title
              },
              get label() {
                const rtn = model.runtime.labelType
                return rtn !== 'none' ? rtn : void 0
              },
              hasUI: true,
              get visible() {
                if (model.style.isVisible()) {
                  return parent ? parent.visible : true
                } else {
                  return false
                }
              },
              get active() {
                return model.state.isFocused()
              },
              model: model,
              get items() {
                let rtn = [];

                if (model.slots) {
                  model.slots.forEach((slot: SlotModel) => {
                    rtn = rtn.concat(fn(slot, this))
                  })
                }
                // if (model.slots) {//TODO
                //   model.slots.forEach((slot: SlotModel) => {
                //     rtn = rtn.concat(fn(slot, this))
                //   })
                // }
                return rtn
              },
              focus() {
                emitItem.focus(model)
              },
              switchView() {
                emitItem.focusFork(model)
              }
            })
          }
        } else {
          rtn.push({
            id: model.id,
            get icon() {
              return null
            },
            get title() {
              return `"${model.runtime.def.namespace}" not found`
            },
            get active() {
              return model.state.isFocused()
            },
            model: model,
            get items() {
              let rtn = [];
              if (model.slots && model.slots.length > 0) {
                model.slots.forEach((slot: SlotModel) => {
                  rtn = rtn.concat(fn(slot, this))
                })
              }
              return rtn
            },
            focus() {
              emitItem.focus(model)
            },
            switchView() {
              emitItem.focusFork(model)
            }
          })
        }
      })
    }
    return rtn
  }
  return fn(viewModel)
}

function searchPlaceholder(model: ComSeedModel,
                           {viewModel, placeholder}: GeoViewContext,
                           position?: { x: number, y: number }) {
  const hoverSlot = viewModel.findHoveringSlot()

  let ptModel = hoverSlot || model.parent || viewModel,
    rootEl = viewModel.$el, ptEl = ptModel.$el as HTMLElement,
    zoom = viewModel.style.zoom;

  let style = model.runtime.model.style, po, se;

  if (position) {
    style = {width: 30, height: 30, top: position.y, left: position.x} as any
    //debugger
  }

  if (!model.parent) {//added com
    let tpo = getPosition(rootEl)
    po = {x: style.left / zoom, y: (style.top - tpo.y) / zoom}
    se = {w: style.width / zoom, h: style.height / zoom}
  } else {
    po = {x: style.left, y: style.top}
    se = {w: style.width, h: style.height}
  }

  let tpo = getPosition(ptEl, rootEl)
  placeholder.x = tpo.x
  placeholder.y = tpo.y
  placeholder.w = (ptEl.offsetWidth) * zoom + 8

  let midh = po.y + se.h / 2;
  let items = ptModel.comAry;

  let find = items.find((md: GeoComModel, idx) => {
    let ele = md.$el as HTMLElement;
    if (ele && !md.style.isLayoutAbsolute()) {
      if (midh <= ele.offsetTop + ele.offsetHeight / 2) {
        placeholder.index = idx;
        placeholder.y = getPosition(ele, rootEl).y
        return true;
      }
    }
  })
  if (!find) {
    items.slice().reverse().find((md: GeoComModel, idx) => {
      let ele = md.$el as HTMLElement;
      if (ele && !md.style.isLayoutAbsolute()) {
        placeholder.y = getPosition(ele, rootEl).y + ele.clientHeight * zoom
        return true
      }
    })

    placeholder.index = items.length;
  }
}