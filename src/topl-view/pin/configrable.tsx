/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * MyBricks team @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */

import {NS_Configurable} from "@sdk";
import {PinContext} from "./Pin";
import {ToplComModel} from "../com/ToplComModel";
import {createEdtItem} from "../util";
import {refactorCons} from "../com/util";
import FrameModel from "../frame/FrameModel";

export function get(pinContext: PinContext, reFocus?: () => any) {
  const {model, context, viewContext, emitComponent} = pinContext
  let rtn = []

  let comCategary = new NS_Configurable.Category(model.isDirectionOfInput() ? '输入' : '输出')
  rtn.push(comCategary)

  //comGroup.addItem(new Configurable.RenderItem('组件', comDef.title))

  const infoGroup = new NS_Configurable.Group();
  comCategary.addGroup(infoGroup)

  infoGroup.addItem(createEdtItem(pinContext, {
    title: 'ID',
    type: 'text',
    options: {
      readonly: true
    },
    value: {
      get() {
        return model.hostId
      }
    }
  }))

  const edtContext = {emitSnap: pinContext.emitSnap}

  infoGroup.addItem(createEdtItem(edtContext, {
    title: '标题',
    type: 'text',
    value: {
      get() {
        return model.title
      },
      set(ctx, val) {
        //if (model.deletable) {
        model.title = val
        const parentModel = model.parent
        if (parentModel instanceof ToplComModel) {
          if (model.isDirectionOfInput()) {
            parentModel.setInputPinTitle(model.hostId, val)
          } else {
            parentModel.setOutputPinTitle(model.hostId, val)
          }
        } else if (parentModel instanceof FrameModel) {
          if (model.isDirectionOfInput()) {
            parentModel.renameInputPin(model.hostId, val)
          } else {
            parentModel.renameOutputPin(model.hostId, val)
          }
        }
        //}
      }
    }
  }))

  // if (model.isDirectionOfInput()) {
  //   infoGroup.addItem(createEdtItem(edtContext, {
  //     title: '允许多个连接',
  //     type: 'checkbox',
  //     options: {
  //       readonly: true
  //     },
  //     description: `是否允许多个输出项连接`,
  //     value: {
  //       get() {
  //         return model.conMax !== 1
  //       },
  //       set(ctx, val) {
  //         // if (model.deletable) {
  //         //   model.title = val
  //         //   const parentModel = model.parent
  //         //   if (parentModel instanceof ToplComModel) {
  //         //     if (model.isDirectionOfInput()) {
  //         //       parentModel.renameInputPin(model.hostId, val)
  //         //     } else {
  //         //       parentModel.renameOutputPin(model.hostId, val)
  //         //     }
  //         //   } else if (parentModel instanceof FrameModel) {
  //         //     if (model.isDirectionOfInput()) {
  //         //       parentModel.renameInputPin(model.hostId, val)
  //         //     } else {
  //         //       parentModel.renameOutputPin(model.hostId, val)
  //         //     }
  //         //   }
  //         // }
  //       }
  //     }
  //   }))
  // }


  // infoGroup.addItem(new Configurable.RenderItem('数据类型', JSON.stringify(model.schema)))

  if (context.isDesnMode()
    //&& (model.deletable || model.parent instanceof ToplComModelForked && model.parent.isStartInDiagram())) {
    && model.deletable) {
    infoGroup.addItem(createEdtItem(edtContext, {
      title: '删除',
      type: 'button',
      value: {
        set() {
          const comModel = model.parent
          if (model.isDirectionOfInput()) {
            comModel.removeInputPin(model.hostId)
          } else {
            comModel.removeOutputPin(model.hostId)
          }
          refactorCons(comModel)
        }
      }
    }))
  }

  if (context.isDebugMode()) {
    const debugGroup = new NS_Configurable.Group();
    comCategary.addGroup(debugGroup)

    debugGroup.addItem(createEdtItem(edtContext, {
      title: '当前值',
      type: 'textarea',
      value: {
        get() {
          const exeModel = model.forkedFrom || model
          if (exeModel.exe !== void 0) {
            return JSON.stringify(exeModel.exe.val)
          }
          return '[空]'
        }
      }
    }))
  }

  // const mockGroup = new Configurable.Group();
  // comCategary.addGroup(mockGroup)
  //
  // let mockData
  // if (model.parent instanceof ToplComModel) {
  //   mockData = context.getComDef((model.parent as ToplComModel).runtime.def).mock
  // }
  // mockGroup.addItem(createEdtItem(edtContext, {
  //   title: `模拟${model.isDirectionOfInput() ? '输入' : '返回'}数据`,
  //   type: 'textarea',
  //   options: {
  //     foldable: true
  //   },
  //   value: {
  //     get() {
  //       if (model._mockData !== void 0) {
  //         return model._mockData
  //       }
  //       return JSON.stringify(mockData
  //         ?.[model.isDirectionOfInput() ? 'inputs' : 'outputs']
  //         ?.[model.hostId])
  //     }, set(ctx, val) {
  //       model._mockData = val
  //     }
  //   }
  // }))


  return rtn;
}

function NoDefined() {
  return (
    <div style={{fontStyle: 'italic', color: 'red'}}>[未定义,请联系开发者]</div>
  )
}

function Null() {
  return (
    <div style={{fontStyle: 'italic', color: '#AAA'}}>[空]</div>
  )
}

