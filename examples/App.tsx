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
  const leftBtns = [], middleBtns = [], rightBtns = []

  if (loaded.handlers) {
    const hary = loaded.handlers
    if (hary) {
      hary.forEach(hd => {
        if (hd.position === 'left') {
          leftBtns.push(jsxHandler(hd))
        } else if (hd.position === 'middle') {
          middleBtns.push(jsxHandler(hd))
        } else if (hd.position === 'right') {
          rightBtns.push(jsxHandler(hd))
        }
      })
    }
  }

  return (
    <div className={css.titleBar}>
      <div className={css.logo}>
        <i>VisualBricks-Demo</i>
      </div>
      <div className={css.btnsLeft}>
        {leftBtns}
      </div>
      <div className={css.btnsHandlers}>
        {middleBtns}
      </div>
      <div className={css.btnsRight}>
        {rightBtns}
        <button onClick={() => save(loaded)}>保存</button>
        {/*<button onClick={publish}>发布</button>*/}
      </div>
    </div>
  )
}

function jsxHandler(handler) {
  const icon = handler.icon
  const style = Object.assign({opacity: handler.disabled ? 0.2 : 1}, handler.style || {})
  return (
    <button disabled={handler.disabled} key={handler.id} onClick={handler.exe}
            style={style}>{icon}</button>
  )
}

function save(loaded) {
  const dumpContent = loaded.dump()

  const searchParam = getLocationSearch()
  localStorage.setItem(`${DUMP_IN_LS}${searchParam.length ? getLocationSearch() : 'dev'}`, JSON.stringify(dumpContent));
  message.info('保存完成.')
}