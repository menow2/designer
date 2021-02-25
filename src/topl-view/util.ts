/**
 * XGraph Opensource
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * Mail:chemingjun@126.com Wechat:ALJZJZ
 */

import {NS_Configurable, T_XGraphComDef} from "@sdk";

export function createEdtAry(comDef: T_XGraphComDef, edtContext, selectors, reFocus?: () => any): Array<NS_Configurable.EditItem> {
  let edtAry;
  if (comDef.editors) {
    const viewOn = comDef.rtType && comDef.rtType.match(/js|scratch/gi) ? comDef.editors : comDef.editors.logic
    if (viewOn) {
      const ary = [];
      Object.keys(selectors).forEach(selector => {
        if (edtAry = viewOn[selector]) {
          edtAry.forEach(edt => {
            if (edt.type) {
              ary.push(createEdtItem(edtContext, edt, reFocus))
            }
          })
        }
      })
      return ary
    }
  }
}

export function createEdtItem(edtContext: { def?, data?, input?, output?, setScript?, emitSnap },
                              editor, reFocus?: () => any) {
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
      description: editor.description,
      value: (function () {
        let initVal, wartForComplete = false;//Prevent for invoke value.get many times before onComplete invoked
        return {
          get() {
            if (!wartForComplete) {
              wartForComplete = true;
              initVal = (editor.value && editor.value.get || (() => undefined))(edtContext)
              initVal = initVal == undefined ? null : initVal;
            }
            return initVal;
          }, set(v) {
            wartForComplete = false;
            const snap = edtContext.emitSnap.start('Change value');
            try {
              (editor.value && editor.value.set || (() => undefined))(edtContext, v)
              snap.commit()
              reFocus && setTimeout(reFocus)
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