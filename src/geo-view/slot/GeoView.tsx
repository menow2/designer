/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * MyBricks team @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */

import React, {useEffect} from 'react'
import {Ignore, observe, useComputed, useObservable} from 'rxui'
import {BaseModel, DesignerContext, NS_Emits, T_ComDef} from '@sdk'

import GeoViewModel from './GeoViewModel'
import DesnView from './DesnView'
import DebugView from './DebugView';
import {getEmitItem} from "./desnViewInit";
import SlotModel from "./SlotModel";
import {GeoComModel} from "../com/GeoComModel";

class Mover {
  x: number
  y: number

  show({x, y}) {
    this.x = x
    this.y = y
  }

  hide() {
    this.x = void 0
  }
}

export class GeoViewContext {
  context: DesignerContext

  viewModel: GeoViewModel

  mover: Mover

  @Ignore
  hoverModel: BaseModel

  placeholder: { x, y, w, index } = {}

  emitLogs: NS_Emits.Logs

  emitItem: NS_Emits.Component

  emitSnap: NS_Emits.Snap
}

export default function GeoView({viewModel}: { viewModel: GeoViewModel }) {
  const emitLogs = useObservable(NS_Emits.Logs, {expectTo: 'parents'})
  const emitItem = useObservable(NS_Emits.Component, {expectTo: 'parents'})
  const emitSnap = useObservable(NS_Emits.Snap, {expectTo: 'parents'})
  const context = observe(DesignerContext, {from: 'parents'})

  const mover = useObservable(Mover)

  const viewCtx = useObservable(GeoViewContext, n => n({
    context,
    viewModel,
    mover,
    emitLogs,
    emitItem,
    emitSnap
  }), {
    to: 'children'
  }, [viewModel])

  observe(NS_Emits.Component, next => {
    next(getEmitItem(viewCtx))
  }, {from: 'parents'}, [viewModel])

  observe(NS_Emits.Module, next => {
    next({
      clearAllTempComs() {
        viewModel.clearAllTempComs()
      }
    })
  }, {from: 'parents'})

  observe(NS_Emits.Debug, n => n({
    setComDebug: (scopePath: string, frameLable: string, instanceId: string, {
      inputs,
      outputs,
      frames
    }, comDef: T_ComDef) => {
      let model: GeoComModel = viewModel.searchCom(instanceId)
      if (model) {
        // if(model.runtime.def.namespace==='power.normal-ui-pc-v2.page-header'){
        //   debugger
        // }
        const debugModel = model.setDebug(scopePath, frameLable, {inputs, outputs, frames})
        return debugModel.runtime
      } else {
        throw new Error(`组件(${comDef.namespace},id=${instanceId})在布局视图中未找到.`)
      }
    },
    stop(){
      viewModel.clearDebugs()
    }
  }), {from: 'parents'}, [viewModel])

  useEffect(() => {
    if (context.isDesnMode()) {
      viewModel.clearAllTempComs()
    }
  }, [context.getMode()])

  return (
    (context.isDebugMode()) ?
      <DebugView key='debugView'/> : <DesnView key='desnView' viewModel={viewModel}/>
  )
}

export function scrollFix(model: SlotModel) {
  if (model.$el) {
    const ele = model.$el.parentNode.parentNode as HTMLElement

    const x = (ele.scrollWidth - model.$el.clientWidth) / 2
    if (!model.style.left
      || x > (model.style.left + ele.offsetWidth)
      || (x + model.$el.clientWidth) < model.style.left) {
      model.style.left = ele.scrollLeft = (ele.scrollWidth - ele.clientWidth) / 2
    }

    ele.scrollLeft = model.style.left

    const y = (ele.scrollHeight - model.$el.clientHeight) / 2
    if (!model.style.top
      || x > (model.style.top + ele.offsetWidth)
      || (x + model.$el.clientHeight) < model.style.top) {
      model.style.top = (ele.scrollHeight - ele.clientHeight) / 2
    }

    ele.scrollTop = model.style.top
  }
}

// export function wheel(evt, viewModel) {
//   viewModel.style.left = Math.round(viewModel.style.left-evt.deltaX)
//   viewModel.style.top = Math.round(viewModel.style.top-evt.deltaY)
//   // evt.nativeEvent['__preventDefault__'] = true
// }
