import css from './App.less';
import './reset-antd.css';

import React, {useCallback, useMemo} from 'react';
import {useObservable} from 'rxui';
import {message} from 'antd';
import Designer from '@visualbricks/designer';

import designerCfg from './config'
import {TitleBar} from "./coms";

import {getLocationSearch} from "./utils";

const DUMP_IN_LS: string = '_app_designer_dump_';

type Action = {
  isTrue: boolean
  exe: () => void
}

export abstract class MyContext {
  apiVisible: boolean = false

  abstract desnApiAdder(): Promise<any>

  abstract apiConfirm(params: any): void

  abstract save(): boolean
}

export abstract class DesignerLoaded {
  actions: {
    navView: Action
    editView: Action
    debugView: Action
  }

  abstract importProject(content: { pageAry: {}[] }): boolean

  abstract importComponent(content: { def, model }): boolean

  abstract dump(): {
    id: string,
    // pageId: string,
    isActive: boolean,
    props: {
      isHome: boolean
    },
    title: string,
    content: { [name: string]: {} }
  }[]
}

export default function SPA() {
  const desnLoaded = useObservable(DesignerLoaded, {to: 'children'})
  const businessCtx = useObservable(MyContext, next => {
    return next({
      apiVisible: false,
      desnApiAdder: () => desnApiAdder(businessCtx),
      save() {
        const dumpContent = desnLoaded.dump()

        const searchParam = getLocationSearch()
        localStorage.setItem(`${DUMP_IN_LS}${searchParam.length ? getLocationSearch() : 'dev'}`, JSON.stringify(dumpContent));
        message.info('保存完成.')
      }
    })
  }, {to: 'children'})

  const designerLoadFn = useCallback((loaded) => {
    Object.assign(desnLoaded, loaded)
  }, [])

  const onMessage = useCallback((type, msg) => {
    message.destroy()
    message[type](msg)
  }, [])

  const onEdit = useCallback((event, content) => {
//console.log(Math.random())
  }, [])

  //配置快捷键
  useMemo(() => {
    Object.assign(designerCfg, {
      keymaps() {
        return {
          ['ctrl+s']() {
            businessCtx.save()
          }
        }
      }
    })
  }, [])

  return (
    <div className={css.mainView} onClick={e => {
      const popups = document.querySelectorAll('.' + css.popup)
      if (popups) {
        popups.forEach(ele => {
          ele.classList.remove(css.popup)
        })
      }
    }}>
      <TitleBar/>
      <Designer config={designerCfg}
                onLoad={designerLoadFn}
                onEdit={onEdit}
                onMessage={onMessage}/>
    </div>
  )
}

function desnApiAdder(businessCtx: MyContext): Promise<any> {
  return new Promise((resolve): void => {
    businessCtx.apiVisible = true
    businessCtx.apiConfirm = async function (params: any): Promise<void> {
      // if (!params.data) {
      //   message.warning('请选择要添加的接口', 1)
      //   throw new Error('未选择接口')
      // }

      resolve(params.data)

      setTimeout(() => {
        businessCtx.apiVisible = false
      })
    }
  })
}