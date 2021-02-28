/**
 * MyBricks Opensource
 * This source code is licensed under the MIT license.
 *
 * MyBricks team @2019
 * Mail:mybricks@126.com Wechat:ALJZJZ
 */

import {NS_Configurable} from "@sdk";
import StageViewContext from "./StageViewContext";

export function getConfigs(svContext: StageViewContext) {
  const {model, context, emitItem, emitSnap} = svContext
  let rtn = []

  const ctxCfgs = context.configs

  const stageCfgs = ctxCfgs.stage?.configs

  let comCategary = new NS_Configurable.Category(stageCfgs?.title || '项目')
  rtn.push(comCategary)

  if (stageCfgs && Array.isArray(stageCfgs.items)) {
    const bgGroup = new NS_Configurable.Group();
    comCategary.addGroup(bgGroup)
    stageCfgs.items.forEach(item => {
      bgGroup.addItem(createEdtItem(svContext, {
        title: item.title,
        type: item.type,
        value: {
          get() {
            return item.value.get()
          },
          set(val) {
            item.value.set(val)
          }
        }
      }))
    })
  }

  //---------------------------------------------------------------------------------------------

  const envGroup = new NS_Configurable.Group('调试')
  comCategary.addGroup(envGroup)

  if (ctxCfgs.debug && Array.isArray(ctxCfgs.debug.envTypes)) {
    envGroup.addItem(createEdtItem(svContext, {
      title: `环境类型`,
      type: 'select',
      options: ctxCfgs.debug.envTypes.map(({id, title}) => ({value: id, label: title})),
      value: {
        get() {
          return context.envVars.debug.envType
        },
        set(val) {
          context.envVars.debug.envType = val
        }
      }
    }))
  }

  /**
   * @description userToken需要根据跟随用户，所以开放给MF处理
   * @author 朱鹏强
   * @time 2021/01/21
   * **/
  if (ctxCfgs.debug && Array.isArray(ctxCfgs.debug.items)) {
    ctxCfgs.debug.items.forEach(item => {
      envGroup.addItem(createEdtItem(svContext, {
        title: item.title,
        type: item.type,
        value: {
          get() {
            return item.value.get() || context.envVars.debug[item.field]
          },
          set(val) {
            context.envVars.debug[item.field] = val
            item.value.set(val)
          }
        }
      }))
    })
  }
  // envGroup.addItem(createEdtItem(svContext, {
  //   title: `用户Token`,
  //   type: 'text',
  //   value: {
  //     get() {
  //       return context.envVars.debug.userToken
  //     },
  //     set(val) {
  //       context.envVars.debug.userToken = val
  //     }
  //   }
  // }))

  envGroup.addItem(createEdtItem(svContext, {
    title: `环境参数`,
    type: 'textarea',
    value: {
      get() {
        return context.envVars.debug.envParams
      },
      set(val) {
        context.envVars.debug.envParams = val
      }
    }
  }))

  return rtn
}

function createEdtItem(comContext: StageViewContext, editor) {
  const {model, emitSnap} = comContext
  const edtContext = {}
  if (typeof editor === 'function') {
    return new NS_Configurable.FunctionItem(function () {
      editor(edtContext)
    })
  } else if (typeof editor === 'object') {
    let options = editor.options
    if (typeof options === 'function') {
      options = editor.options(edtContext)
    }

    return new NS_Configurable.EditItem({
      title: editor.title,
      type: editor.type,
      value: (function () {
        let initVal, wartForComplete = false;//Prevent for invoke value.get many times before onComplete invoked
        return {
          get() {
            if (!wartForComplete) {
              wartForComplete = true;
              initVal = (editor.value && editor.value.get || (() => undefined))()
              initVal = initVal == undefined ? null : initVal;
            }
            return initVal;
          }, set(v) {
            wartForComplete = false;
            const snap = emitSnap.start('Change value');
            try {
              (editor.value && editor.value.set || (() => undefined))(v)
              snap.commit()
            } catch (ex) {
              throw ex;
            }
          }
        }
      })(), options
    })
  } else {
    throw new Error(`Invalid typeof editor(function or object expect)`)
  }
}