/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * MyBricks team @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */

import {evt, observe, useComputed} from "rxui";
import css from "./Normal.less";
import {useEffect, useMemo} from "react";
import {ComContext} from "../GeoCom";
import {getEnv, getInputs, getOutputs, getStyle} from "../comCommons";
import {edtOnSelectorAry, getEditorPath} from '../editorUtils'
import {GeoComModel} from "../GeoComModel";
import Slot from "../../slot/Slot";

import {get as getConfigurable, getEditContext} from "../configrable";
import {get as getListenable} from "./listenable";
import {TextEditorsReg} from "../../config";
import {refactorStyle} from "../../geoUtil";
import {NS_Configurable, NS_Listenable} from "@sdk";
import I_Configurable = NS_Configurable.I_Configurable;
import I_Listenable = NS_Listenable.I_Listenable;

export default function Normal({mouseDown}) {
  const comContext = observe(ComContext, {from: 'parents'})

  const {comDef, model, context, emitItem, emitLogs} = comContext

  const style = useComputed(computeStyle)

  //Init
  useMemo(() => {
    if (!model.init) {
      model.init = true

      if (comDef.editors && !model.runtime.initState.editorInitInvoked) {
        model.runtime.initState.editorInitInvoked = true

        const editors = comDef.editors
        const initFn = editors['@init']
        if (typeof initFn === 'function') {
          initFn(getEditContext(comContext))
        }
      }
    }

    ;(model as I_Configurable).getConfigs = function () {
      return getConfigurable(comContext)
    }
    ;(model as I_Listenable).getListeners = function () {
      return getListenable(comContext)
    }
  }, [])

  useEffect(() => {
    let comEle = model.$el;
    if (comEle) {
      const realEle: HTMLElement = comEle.children[0] as HTMLElement

      //model.style.width = '100%'//100% width///TODO temp
      //model.style.display = 'block'

      /**
       * 布局问题，组件样式设置
       * **/
      if (realEle && model.style.width === void 0) {
        const nowWidth = realEle.offsetWidth
        comEle.classList.add(css.fullWidth)

        if (nowWidth !== realEle.offsetWidth) {
          model.style.width = '100%'//100% width
          model.style.display = 'block'
        } else if (nowWidth === model.parent.$el.offsetWidth) {
          model.style.width = '100%'//100% width
          model.style.display = 'block'

        }
        /**
         * @description 修复画布区域设置padding后，导致的组件宽度问题
         * @author 朱鹏强
         * @time 2021/02/24
         * **/
        else if (nowWidth === getContentWidth(model.parent.$el)) {
          model.style.width = '100%'
          model.style.display = 'block'
        } else {
          model.style.width = 'fit-content'
          model.style.display = 'inline-block'
        }
        comEle.classList.remove(css.fullWidth)
      }

      // comEle.querySelectorAll('a[href]').forEach(alink => {
      //   alink['href'] = 'javascript:void(0);'
      // })

      let styleSheets = document.styleSheets
      const styleSheet = [].find.call(styleSheets, (stylesheet: CSSStyleSheet) => {
        return stylesheet.ownerNode && stylesheet.ownerNode.nodeName.toLowerCase() === 'style'
      })

      styleSheet.addRule(`${model.id}-focus`, '');

      edtOnSelectorAry(comDef).forEach(({selector, edtAry}) => {
        if (!selector.match(/^\@|\*/)) {
          let eAry;
          if (!Array.isArray(edtAry) && typeof edtAry === 'object') {
            if (!Array.isArray(edtAry.items)) {
              throw new Error(`Invalid value type for selector(${selector}) in component(${comDef.namespace}),expect {items:[],title:string}.`)
            }
            eAry = edtAry.items
          } else {
            eAry = edtAry
          }
          let isItemEditable = false

          if (Array.isArray(eAry)) {
            eAry = eAry.filter(item => item)
            isItemEditable = eAry.find(item => {
              return item && item.type
              //&& !item.type.match(/^_.+$/gi)
            })
          }
          if (isItemEditable) {
            if (eAry.find(item => {
              return item && item.type && !item.type.match(/^_.+$/gi)
            })) {
              // styleSheet.addRule(`.${model.id}-focus ${selector}`, `
              //       outline-offset: -1px;
              //       outline: 1px dashed rgba(133, 133, 133, 0.4);
              //       pointer-events: auto !important;
              //       cursor:pointer;
              //     `)
              styleSheet.addRule(`.${model.id}-focus ${selector}`, `
                    pointer-events: auto !important;
                    cursor:pointer;
                  `)
            } else {
              styleSheet.addRule(`.${model.id}-focus ${selector}`, `
                    pointer-events: auto !important;
                    cursor:pointer;
                  `)
            }
            styleSheet.addRule(`.${model.id}-focus ${selector}:hover`, `
                   outline-offset: -2px;
                   outline: 1px dashed #FFA208 !important;
                   overflow:hidden !important;
                  `)
            // styleSheet.addRule(`.${model.id}-focus ${selector} *`, `
            //         pointer-events: none !important;
            //       `)
          }
        }
      })

      comEle.addEventListener('DOMNodeRemoved', function (e) {
        // setTimeout(v=>{
        //   model.notifyEleChanged()
        // })
        model.notifyEleChanged()
      })
    }

    if (model.state.isFocused()) {
      emitItem.focus(model)
    }
  }, [])

  const rtContent = useComputed(() => {
    if (comDef) {
      if (comDef.runtime) {
        return (
          <comDef.runtime data={model.data}
                          env={getEnv(model, comContext)}
                          style={getStyle()}
                          slots={renderSlots(model, 'dev')}
                          inputs={getInputs()}
                          outputs={getOutputs()}
                          key={model.id + 'dev'}
                          _onError_={(ex, type) => {
                            if (type === 'render') {
                              return (
                                <div className={css.error}>组件发生错误:{ex.message}</div>
                              )
                            } else {
                              emitLogs.error('组件异常', ex.stack.replaceAll(/\/n/gi, '<br/>'))
                            }
                          }}
          />
        )
      }
    } else {
      return `"${model.runtime.def.namespace}" not found`
    }
  })

  const classes = useComputed(() => {
    const rtn = [css.com, css.desn]

    // const resizeHEditor = getResizeHEditor(comDef)
    // if (resizeHEditor) {
    //   if (resizeHEditor.get === 'function') {
    //     const width = resizeHEditor.get()
    //     if (width === void 0 || width === '100%') {
    //       rtn.push(css.fullWidth)
    //     }
    //   } else {
    //     rtn.push(css.fullWidth)
    //   }
    // }
    if (model.state.isFocused()) {
      rtn.push(`${model.id}-focus ` + css.focus)
    }

    if (model.state.isEditing()) {
      rtn.push(css.editable)
    }
    if (model.runtime.labelType === 'todo') {
      rtn.push(css.labelTodo)
    }
    if (!model.style.isLayoutAbsolute() && model.state.isMoving()) {
      rtn.push(css.moving)
    }
    if (model.runtime.upgrade) {
      rtn.push(css.warn)
    }
    return rtn.join(' ')
  })

  return (
    <div ref={el => el && (model.$el = el)}
         style={style}
      // data-geo-com-namespace={model.runtime.def.namespace}
         className={classes}
         onMouseOver={evt(mouseOver).stop}
         onMouseOut={evt(mouseout).stop}
         onClick={evt(click).stop}
         onDoubleClick={evt(dbClick).stop}
         onMouseDown={evt(mouseDown).stop}>
      {rtContent}
      {model.runtime.upgrade ?
        <div className={css.info} dom-type-info='1'>
          <ul>
            <li>{model.runtime.upgrade.info}</li>
          </ul>
          <p className={css.upgrade} onClick={upgrade}>更新</p>
        </div> :
        ''}
    </div>
  )
}

function renderSlots(model: GeoComModel, env) {
  if (model.slots) {
    const rst = {}
    model.slots.forEach(slot => {
      rst[slot.id] = {
        id: slot.id,
        title: slot.title,
        render(opt) {
          return <Slot key={slot.id + env} model={slot} options={opt}/>
        }
      }
    })
    return rst
  }
}

function dbClick(evt) {
  const comContext = observe(ComContext)
  const {model, comDef, context, emitItem, emitSnap} = comContext
  const found = getEdtAreaEle(evt.target, comContext)
  if (found && found.editorAry && found.editorAry.find(({type}) => type && type.match(TextEditorsReg))) {
    return
  } else {
    emitItem.focusFork(model)
  }
}

function upgrade() {
  const {model, context, emitItem, emitSnap} = observe(ComContext)
  emitItem.upgrade(model)
}

function mouseOver() {
  const {model, context, emitItem, emitSnap} = observe(ComContext)

  emitItem.hover(model)
}

function mouseout() {
  const {emitItem} = observe(ComContext)
  if (emitItem) {
    emitItem.hover(null)
  }
}

function click(evt) {
  const comContext = observe(ComContext)
  const {model, comDef, context, emitItem, emitSnap} = comContext

  //console.log('clicked', this.model.state.isFocused(),this.model.state.isEditing())

  if (context.isDebugMode()) return

  let state = model.state
  if (state.isMoving()) {
    emitItem.focus(model)
    return
  }

  const focusAreaEles = model.$el.querySelectorAll(`.${css.editableFocus}`)
  if (focusAreaEles.length > 0) {
    for (let i = 0; i < focusAreaEles.length; i++) {
      focusAreaEles[i].classList.remove(css.editableFocus)
    }
  }

  if (state.isEnabled()) {
    if (model.focusArea) {
      //model.focusArea.ele.classList.remove(css.editableFocus)
      model.focusArea = void 0
    }
    // state.focus()//Focus now,so parent could found it

    emitItem.focus(model)
  } else if (state.isFocused()) {
    // state.focusedTimeRefresh()
    // if (state.focusedStepTime < 300) {
    //   return
    // }

    const found = getEdtAreaEle(evt.target, comContext)

    if (found) {
      const {title, ele, editorAry, editorPath} = found

      // if (model.focusArea) {
      //   model.focusArea.ele.classList.remove(css.editableFocus)
      // }

      ele.classList.add(css.editableFocus)

      model.setFocusArea(ele, ele['_vc_init_'].selectors, editorPath, title)

      emitItem.focus(model)
    } else {
      model.focusArea = void 0
      emitItem.reFocus(model)
      //state.focus()
    }
    state.editing()

  }
}

function computeStyle() {
  const comContext = observe(ComContext)
  const {model, context, emitItem, emitSnap, comDef} = comContext

  if (comDef?.editors) {
    const viewEditors = comDef.editors['view'] || comDef.editors
    if (viewEditors) {
      if (typeof viewEditors['@willMount'] === 'function') {
        viewEditors['@willMount'](getEditContext(comContext))
      }
    }
  }

  const css = model.style.toCSS()
  let sty = {}
  for (let nm in css) {
    sty[nm] = css[nm]
  }

  //sty['display'] = 'block'//Ignore display in runtime

  if (!model.style.isVisible()) {
    sty['width'] = '100%'
    sty['visibility'] = 'hidden'
    sty['position'] = 'absolute'
  }

  const {left, top, width, height} = model.style
//console.log(sty)

  if (context.isDesnMode()) {
    sty = Object.assign(sty, model.style.isLayoutAbsolute() ? {
      // transform: model.isLayoutAbsolute() ?
      //   `translateY(${model.position.y}px) translateX(${model.position.x}px)` : '',
      zIndex: 1,
      position: 'absolute',
      left: left + 'px',
      top: top + 'px',
      width: width + 'px',
      height: height + 'px'
    } : {
      //height: height ? (height + 'px') : undefined
    })
  } else {
    sty = Object.assign(sty, model.style.isLayoutAbsolute() ? {
      zIndex: 1,
      position: 'absolute',
      left: left + 'px',
      top: top + 'px',
      width: width + 'px',
      height: height + 'px'
    } : {})
  }

  refactorStyle(sty)

  delete sty['display']

  return sty
}

function getEdtAreaEle(targetEle, comContext: ComContext): {
  editorPath: {
    title: string,
    ele: HTMLElement
  }[]
  title: string,
  ele: HTMLElement,
  editorAry: {}[]
} {
  const {model, comDef, context} = comContext

  //const comEle = model.$el as HTMLElement;
  const comEle = model.$el.firstChild as HTMLElement;
  // if (targetEle === comEle) {
  //   return;
  // }
  const editOnAry = edtOnSelectorAry(comDef)

  const elesInSelector: { selector, eles }[] = []

  let foundTitle, foundEle, foundEdtAry;
  editOnAry.forEach(({selector, edtAry, viewOn}) => {
    // if(selector==='[data-item-type=composition]'){
    //   debugger
    // }

    if (!selector.match(/^\@|\*/)) {

      // if(foundEle){
      //   debugger
      // }

      let edtAry = viewOn[selector], isItemEditable = false;
      let title
      if (!Array.isArray(edtAry) && typeof edtAry === 'object') {
        if (!Array.isArray(edtAry.items)) {
          throw new Error(`Invalid value type for selector(${selector}) in component(${comDef.namespace}),expect {items:[],title:string}.`)
        }
        title = edtAry.title
        edtAry = edtAry.items
      }

      if (Array.isArray(edtAry)) {
        isItemEditable = edtAry.find(
          ({type}) => type
          //&& !type.match(/^_.+$/gi)
        )//_** ReservedEditors
      }
      if (isItemEditable) {
        let selAll;
        try {
          selAll = comEle.querySelectorAll(selector);
        } catch (ex) {
          selAll = comEle.querySelectorAll(':scope' + selector);
        }

        elesInSelector.push({
          selector,
          title,
          edtAry,
          eles: selAll
        })
      }
    }
  })

  if (elesInSelector.length > 0) {
    let tel = targetEle;
    do {
      if (elesInSelector.find(({selector, title, edtAry, eles}) => {
        return [].find.call(eles, ele => {
          if (tel === ele) {
            foundTitle = title
            foundEle = ele
            if (!foundEle['_vc_init_']) {
              foundEle['_vc_init_'] = {selectors: {[selector]: true}};
            } else {
              foundEle['_vc_init_'].selectors[selector] = true
            }
            if (!foundEdtAry) {
              foundEdtAry = edtAry
            }
            return true
          }
        })
      })) {
        break
      }
      tel = tel.parentNode
    } while (tel.parentNode)
  }

  if (foundEle) {
    const editorPath: { title: string, ele: HTMLElement }[] = getEditorPath(foundEle, model, context)
    return {
      editorPath,
      title: foundTitle,
      ele: foundEle,
      editorAry: foundEdtAry
    }
  }
}

/**
 * @description 获取Dom内容宽度
 * @author 朱鹏强
 * @time 2021/02/24
 * **/
function getContentWidth(ele: HTMLElement) {
  const width = parseFloat(getComputedStyle(ele).width)
  let contentWidth = width
  const paddingLAndR = ['Left', 'Right']
  paddingLAndR.forEach(item => {
    contentWidth -= parseFloat(getComputedStyle(ele)[`padding${item}`])
  })

  return contentWidth
}