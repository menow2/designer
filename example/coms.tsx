import {observe, useComputed} from "rxui";
import css from "./App.less";
import React from "react";
import {DesignerLoaded, MyContext} from "./App";

export function TitleBar() {
  const loaded = observe(DesignerLoaded, {from: 'parents'})
  const ctx = observe(MyContext, {from: 'parents'})

  const navBtn = useComputed(() => {
    let actions
    if (actions = loaded.actions) {
      if (actions.navView) {
        return (
          <button onClick={actions.navView.exe}>
            {actions.navView.isTrue ? '<' : '>'}
          </button>
        )
      }
    }
  })

  const editBtn = useComputed(() => {
    let actions
    if (actions = loaded.actions) {
      if (actions.editView) {
        return (
          <button style={{float: 'right'}} onClick={actions.editView.exe}>
            {actions.editView.isTrue ? '>' : '<'}
          </button>
        )
      }
    }
  })

  const debugBtn = useComputed(() => {
    let actions
    if (actions = loaded.actions) {
      if (actions.debugView) {
        return (
          <button style={{backgroundColor: 'red'}}
                  disabled={!actions.debugView.isEnable} onClick={actions.debugView.exe}>
            {actions.debugView.isTrue ? '编辑' : '调试'}
          </button>
        )
      }
    }
  })

  return (
    <div className={css.titleBar}>
      <div className={css.logo}>
        <i style={{paddingRight: 10}}>VisualBricks-Demo</i>
      </div>
      <div className={css.btnsLeft}>
        {navBtn}
      </div>
      <div className={css.btnsHandlers}>

      </div>
      <div className={css.btnsRight}>
        <button onClick={ctx.save}>保存</button>
        {debugBtn}
        {/*<button onClick={publish}>发布</button>*/}
        {editBtn}
      </div>
    </div>
  )
}