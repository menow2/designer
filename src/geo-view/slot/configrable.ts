/**
 * MyBricks Opensource
 * This source code is licensed under the MIT license.
 *
 * MyBricks team @2019
 * Mail:mybricks@126.com Wechat:ALJZJZ
 */

import {NS_Configurable} from "@sdk";
import {antiShaking} from "@utils";
import {GeoViewContext} from "./GeoView";

//Record for current active editor array
let activeEditorAry = []

export function get(geoViewContext: GeoViewContext) {
  activeEditorAry = []

  const {viewModel: model, context, emitItem} = geoViewContext
  const rtn = []

  const normalCategary = new NS_Configurable.Category('布局视图')
  rtn.push(normalCategary)

  let normalGroup = new NS_Configurable.Group();
  normalCategary.addGroup(normalGroup)

  normalGroup.addItem(createEdtItem(geoViewContext, {
    title: '背景色',
    type: 'colorPicker',
    description: `设置页面的背景色`,
    value: {
      get() {
        return model.style.backgroundColor || 'RGBA(255,255,255,.8)'
      }, set(val) {
        model.style.backgroundColor = val
      }
    }
  }))


  normalGroup.addItem(createEdtItem(geoViewContext, {
    title: '页面间距',
    type: 'inputNumber',
    options: [
      {
        title: '上',
        width: 67
      }, {
        title: '左',
        width: 67
      }, {
        title: '右',
        width: 67
      }
    ],
    value: {
      get() {
        return [
          model.style.paddingTop,
          model.style.paddingLeft,
          model.style.paddingRight
        ]
      },
      set([top, left, right]) {
        model.style.paddingTop = top
        model.style.paddingLeft = right
        model.style.paddingRight = left
      }
    }
  }))

  return rtn.map(catelog => {
    catelog.groups && (catelog.groups.forEach(group => {
      group.items && (group.items = group.items.filter(item => item))
    }))
    return catelog
  })
}

function createEdtItem(geoViewContext: GeoViewContext, editor: any) {
  activeEditorAry.push(editor)

  const {model, emitItem, emitSnap, emitCanvasView} = geoViewContext
  if (typeof editor === 'object') {
    let ifVisible
    if (typeof editor.ifVisible === 'function') {
      ifVisible = () => {
        const activeF = activeEditorAry.indexOf(editor) >= 0//To avoid triger observable in disactive editor
        if (activeF) {
          const rtn = editor.ifVisible()
          return typeof (rtn) === 'boolean' ? rtn : false
        }
      }
    }
    let options = editor.options
    if (typeof options === 'function') {
      options = editor.options()
    }

    const describer = {
      title: editor.title,
      type: editor.type,
      description: editor.description,
      value: (function () {
        let initVal, wartForComplete = false;//Prevent for invoke value.get many times before onComplete invoked
        return {
          get() {
            if (!wartForComplete) {
              wartForComplete = true

              initVal = (editor.value && editor.value.get || (() => undefined))()
              initVal = initVal == undefined ? null : initVal;
            }
            return initVal;
          }, set(v) {
            antiShaking().push(() => {
              try {
                initVal = v
                wartForComplete = false;

                const snap = emitSnap.start('Change value');
                const fn = (editor.value && editor.value.set || (() => undefined))

                fn(v)
                snap.commit()
                /**
                 * @description 注释 emitItem.reFocus() ，修复布局视图修改数据后失焦问题
                 * @author 梁李昊
                 * @time 2021/02/19
                 * **/
                // emitItem.reFocus()
              } catch (ex) {
                throw ex;
              }
            })
          }
        }
      })(), options, ifVisible
    }

    return new NS_Configurable.EditItem(describer)
  } else {
    throw new Error(`Invalid typeof editor(function or object expect)`)
  }
}