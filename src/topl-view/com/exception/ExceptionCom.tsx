/**
 * XGraph Opensource
 * This source code is licensed under the MIT license.
 * 
 * CheMingjun @2019
 * Mail:chemingjun@126.com Wechat:ALJZJZ
 */

import {evt, observe, useComputed} from 'rxui';
import css from './ExceptionCom.less';
import {ComContext} from '../ToplCom';
import {ToplComModel} from "../ToplComModel";
import {useMemo} from "react";
import {get as getListenable} from "../listenable";
import {NS_Listenable} from "@sdk";
import I_Listenable = NS_Listenable.I_Listenable;

export default function ExceptionCom({model,type, msg}: { model:ToplComModel,type: string, msg: string }) {
  const comContext = observe(ComContext, {from: 'parents'})

  useMemo(()=>{
    ;(model as I_Listenable).getListeners = function () {
      if (comContext.context.isDesnMode()) {
        return getListenable(comContext)
      }
    }
  },[])

  const style = useComputed(() => {
    let sty = model.style;

    return {
      left: sty.left + 'px',
      top: sty.top + 'px',
      //height: pinHeight + 'px'
    }
  })

  return (
    <div ref={el => el && (model.$el = el)}
         className={`${css[type]}`}
         style={style}
         onClick={evt(click).stop}>
      {msg}
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

  if (wrapper) {
    emitItem.focus(wrapper)
  } else {
    emitItem.focus(model)
  }
}