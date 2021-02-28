/**
 * MyBricks Opensource
 * This source code is licensed under the MIT license.
 *
 * MyBricks team @2019
 * Mail:mybricks@126.com Wechat:ALJZJZ
 */

import {evt, observe, useComputed} from 'rxui';
import {NS_Configurable, NS_Listenable} from '@sdk';
import {useMemo} from 'react';
import css from './Normal.less';
import cssParant from '../ToplCom.less';

import {ComContext, getStyle, Info, Inputs, mouseDown, Ouputs} from '../ToplCom';
import {get as getConfigurable, getEditContext} from '../configrable'
import {get as getListenable} from '../listenable'
import {ICON_COM_DEFAULT} from "@sdk";
import I_Configurable = NS_Configurable.I_Configurable;
import I_Listenable = NS_Listenable.I_Listenable;

export default function Normal() {
  const comContext = observe(ComContext, {from: 'parents'})
  const {model, comDef, context} = comContext

  useMemo(() => {
    if (!model.init) {
      model.init = true

      // if (!model.runtime.noRender&&model.inputPinExts.length<=0) {
      //   PinExtInputs.forEach(pin => {
      //     model.addInputPinExt(pin.hostId, pin.title, pin.schema as T_PinSchema)
      //   })
      // }

      if (comDef.editors && !model.runtime.initState.editorInitInvoked) {
        model.runtime.initState.editorInitInvoked = true

        let editors = comDef.editors
        const initFn = editors['@init']
        if (typeof initFn === 'function') {
          initFn(getEditContext(comContext))
        }
      }
    }

    (model as I_Configurable).getConfigs = function () {
      return getConfigurable(comContext)
    }
    ;(model as I_Listenable).getListeners = function () {
      if (context.isDesnMode()) {
        return getListenable(comContext)
      }
    }
  }, [])

  const classes = useComputed(() => {
    const rtn = []
    rtn.push(css.com)
    !model.runtime.hasUI() && rtn.push(css.calculate)
    model.error && rtn.push(cssParant.error)
    model.runtime.upgrade && rtn.push(cssParant.warn)
    model.runtime.labelType === 'todo' && rtn.push(cssParant.labelTodo)

    model.state.isFocused() && rtn.push(cssParant.focus)
    model.state.isMoving() && rtn.push(cssParant.moving)

    return rtn.join(' ')
  })

  const iconSrc = useMemo(() => {
    if (comDef.icon && comDef.icon.toUpperCase().startsWith('HTTP')) {
      return comDef.icon
    }
    return ICON_COM_DEFAULT
  }, [])

  return (
    <div ref={el => el && (model.$el = el)}
         data-topl-com-namespace={model.runtime.def.namespace}
         className={classes}
         style={getStyle(model)}
         onClick={evt(click).stop}
         onDoubleClick={evt(dblClick).stop}
         onMouseDown={evt(mouseDown).stop.prevent}>
      {
        model.runtime.hasUI() ? (
          <div className={css.comIcon}>
            <img src={iconSrc}/>
          </div>
        ) : null
      }
      <p className={css.title}>{model.runtime.title || comDef.title}</p>
      <Inputs model={model}/>
      <Ouputs model={model}/>
      <Info model={model}/>
    </div>
  )
}

function click(evt) {
  const {model, wrapper, emitItem, emitSnap} = observe(ComContext)

  // if (model.state.isFocused()) {
  //   emitItem.blur(model)
  //   model.blur()
  // } else {
  //
  // }
  emitItem.focus(model)
}

function dblClick(evt) {
  const {model, comDef, context, emitItem, emitSnap} = observe(ComContext)
  if (context.isDebugMode()) {
    return
  }

  if (context.isDesnMode()) {
    emitItem.focusFork(model)
  }
}