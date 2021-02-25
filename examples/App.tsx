import css from './App.less';

import React, {useCallback} from 'react';
import {message} from 'antd';
import Designer from '@visualbricks/designer';

import designerCfg from './config'

import {getLocationSearch} from "./utils";
import {useState} from "React";
import {DUMP_IN_LS} from "./constants";

export default function App() {
  const [loaded, setLoaded] = useState({
    actions: void 0,
    dump: void 0
  })

  const onMessage = useCallback((type, msg) => {
    message.destroy()
    message[type](msg)
  }, [])


  Object.assign(designerCfg, {
    keymaps() {
      return {
        get ['ctrl+s']() {
          return () => {
            save(loaded)
          }
        }
      }
    }
  })

  return (
    <div className={css.mainView}>
      <TitleBar loaded={loaded}/>
      <Designer config={designerCfg}
                onLoad={loaded => setLoaded(loaded)}
                onMessage={onMessage}/>
    </div>
  )
}

function TitleBar({loaded}) {
  let navBtn, editBtn, debugBtn

  if (loaded.actions) {
    let actions = loaded.actions
    if (actions.navView) {
      navBtn = (
        <button onClick={actions.navView.exe}>
          {actions.navView.isTrue ? '<' : '>'}
        </button>
      )
    }

    if (actions.editView) {
      editBtn = (
        <button style={{float: 'right'}} onClick={actions.editView.exe}>
          {actions.editView.isTrue ? '>' : '<'}
        </button>
      )
    }

    if (actions.debugView) {
      debugBtn = (
        <button style={{backgroundColor: 'red'}}
                disabled={!actions.debugView.isEnable} onClick={actions.debugView.exe}>
          {actions.debugView.isTrue ? '编辑' : '调试'}
        </button>
      )
    }
  }

  return (
    <div className={css.titleBar}>
      <div className={css.logo}>
        <i>VisualBricks-Demo</i>
      </div>
      <div className={css.btnsLeft}>
        {navBtn}
      </div>
      <div className={css.btnsHandlers}>

      </div>
      <div className={css.btnsRight}>
        <button onClick={() => save(loaded)}>保存</button>
        {debugBtn}
        {/*<button onClick={publish}>发布</button>*/}
        {editBtn}
      </div>
    </div>
  )
}

function save(loaded) {
  const dumpContent = loaded.dump()

  const searchParam = getLocationSearch()
  localStorage.setItem(`${DUMP_IN_LS}${searchParam.length ? getLocationSearch() : 'dev'}`, JSON.stringify(dumpContent));
  message.info('保存完成.')
}