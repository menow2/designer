/**
 * XGraph Opensource
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * Mail:chemingjun@126.com Wechat:ALJZJZ
 */

import css from './Designer.less'

import {Ignore, observe, takeSnap, undo, redo, useComputed, useObservable, uuid} from "rxui";
import {
  ComSeedModel,
  DesignerContext,
  NS_Emits,
  NS_Listenable,
  T_DesignerConfig, T_XGraphComDef
} from "@sdk";

import React, {useMemo} from "react";
import ComOutliner from "./nav-view/ComOutliner";

import {dump as dumpPage, StageView} from "./stage-view";
import EditView from "./edit-view";
import ConsoleView from "./console-view";

import {deepClone} from "@utils";

type T_Params = {
  config: T_DesignerConfig,
  onLoad: (handlers) => {
    actions: {
      debug: Action
    }
    importProject(content: { pageAry: {}[] }): boolean
    importComponent(content: { def, model }): boolean
    dump(): { [p: string]: {} }
  }
  onMessage: (type: 'info' | 'warn' | 'error' | 'trace', message: string) => void
  onEdit: (event: 'change', content?) => void
}

type Action = {
  id: string;
  title: string;
  active?: boolean;
  exe: () => void;
}

class MyContext {
  loaded: boolean = false

  pageAry: Array<{
    id: string,
    // pageId: string,
    isActive: boolean,
    props: {
      isHome: boolean
    },
    title: string,
    content: { [name: string]: {} }
  }>

  showNavView: boolean = true

  toggleNavView() {
    this.showNavView = !this.showNavView
  }

  showEditView: boolean = true

  toggleEditView() {
    this.showEditView = !this.showEditView
  }

  handlersDisabled: boolean = false

  listeners

  emitLogs: NS_Emits.Logs

  emitSnap: NS_Emits.Snap

  emitItem: NS_Emits.Component

  emitMessage: NS_Emits.Message
}

let myContext: MyContext

export default function Designer({config, onLoad, onMessage, onEdit}: T_Params) {
  observe(NS_Emits.Views, next => next({
    hideNav() {
      myContext.showNavView = false
    },
    showNav() {
      myContext.showNavView = true
    },
    disableHandlers() {
      myContext.handlersDisabled = true
    },
    enableHandlers() {
      myContext.handlersDisabled = false
    }
  }), {from: 'children', expectTo: 'children'})

  const emitMessage = observe(NS_Emits.Message,
    next => ({
      info(message) {
        if (onMessage) {
          onMessage('info', message)
        }
      },
      warn(message) {
        if (onMessage) {
          onMessage('warn', message)
        }
      },
      error(message) {
        if (onMessage) {
          onMessage('error', message)
        }
      },
      trace(message) {
        if (onMessage) {
          onMessage('trace', message)
        }
      }
    }),
    {from: 'children'})

  const emitSnap = observe(NS_Emits.Snap, () => ({
    start(name) {
      const snap = takeSnap(name || 'todo', (obj, prop, val) => {
        // console.log('==>obj:', obj)
        // console.log('==>prop:', prop)
        // console.log('==>val:', val)
        // console.log('\n')
      })
      // TODO
      // throw callback for App
      return {
        commit() {
          snap.commit()
          if (onEdit) {
            onEdit('change')
          }
        }, cancel() {
          snap.cancel()
          emitLogs.warn('操作回滚', `操作回滚到${name || 'todo'}之前.`)
        }
      }
    }
  }), {from: 'children'})

  observe(NS_Emits.Component, next => next({
    focus(model) {
      desnContext.focus(model)
    },
    reFocus(model) {
      desnContext.reFocus(model)
    },
    blur() {
      desnContext.blur()
    }
  }), {from: 'children', expectTo: 'children'})

  const emitItem = useObservable(NS_Emits.Component, {expectTo: 'children'})
  const emitLogs = observe(NS_Emits.Logs, {from: 'children', expectTo: 'children'})

  myContext = useObservable(MyContext, next => next({
    emitLogs,
    emitSnap,
    emitItem,
    emitMessage,
    pageLoader: config.pageLoader,
  }))

  //Global context
  const desnContext = useObservable(DesignerContext, {
    to: 'children'
  })

  useComputed(() => {
    if (desnContext.focusModelAry.length === 1) {
      const fmodel = desnContext.focusModelAry[0]
      const listeners = (fmodel as NS_Listenable.I_Listenable)?.getListeners
      if (typeof listeners === 'function') {
        const handlers: any[] = listeners()
        myContext.listeners = handlers
      } else {
        myContext.listeners = void 0
      }
    } else {
      myContext.listeners = void 0
    }
  })

  //Shortcuts
  useMemo(() => {
    desnContext.configs = config

    let keyMaps = {
      ['ctrl+z']() {
        undo.exe()
      },
      ['ctrl+shift+z']() {
        redo.exe()
      }
    }

    document.addEventListener('paste', function (evt) {
      if (!myContext.showNavView) return
      const tag = evt.target as HTMLElement;
      if (tag.tagName.match(/INPUT|TEXTAREA/gi)
        || tag.contentEditable && tag.contentEditable == 'true') {
        return
      }

      const clipdata = evt.clipboardData || window.clipboardData;
      const json = clipdata.getData('text/plain')
      if (json) {
        let obj
        try {
          obj = JSON.parse(json)
        } catch (ex) {

        }
        if (obj) {
          const snap = emitSnap.start('importCom')
          try {
            importComponent(obj, desnContext)
            snap.commit()
          } catch (ex) {
            console.error(ex)
            emitLogs.error('复制发生错误', ex.message)
            snap.cancel()
          }
        }
      }
    })

    document.addEventListener('keydown', event => {
      let tag = event.target as HTMLElement;
      if (tag.tagName.match(/INPUT|TEXTAREA/gi)
        || tag.contentEditable && tag.contentEditable == 'true') {
        return
      }

      let evtKey = event.key
      if (evtKey !== 'Meta') {
        if ((event.ctrlKey || event.metaKey)) {
          if (event.shiftKey) {
            evtKey = 'ctrl+shift+' + evtKey
          } else {
            evtKey = 'ctrl+' + evtKey
          }
        }
      }

      const handlers: any[] = myContext.listeners
      if (handlers) {
        const did = handlers.find(hd => {
          if (Array.isArray(hd.keys)) {
            if (hd.keys.find(keyName => keyName === evtKey)) {
              hd.exe(event)
              return true
            }
          }
        })
        if (did) {
          event.preventDefault()
          return
        }
      }

      let nkeyMaps = {}

      if (typeof config.keymaps === "function") {
        const maps = config.keymaps()
        if (typeof maps === 'object') {
          const nms = Object.getOwnPropertyNames(maps)
          nms.forEach(nm => {
            nkeyMaps[nm] = maps[nm]
          })
        }
        Object.assign(nkeyMaps, keyMaps)
      } else {
        nkeyMaps = keyMaps
      }

      const fn = nkeyMaps[evtKey]
      if (typeof fn == "function") {
        fn()
        event.preventDefault()
        return
      }
    })
  }, [])

  useMemo(async () => {
    const libAry = await desnContext.configs.comlibLoader()
    if (!Array.isArray(libAry)) {
      throw new Error(`Invalid comlibAry.`)
    }

    //desnContext.comLibAry.push(xgComLib)

    if (config.pageLoader) {
      const pageAry = await config.pageLoader()
      if (pageAry !== void 0 && !Array.isArray(pageAry)) {
        throw new Error(`Invalid pageAry.`)
      }

      myContext.pageAry = pageAry
    }
    myContext.loaded = true

    onLoad(genLoadedObj(desnContext, myContext))
  }, [])

  const classNames = useComputed(() => {
    const rtn = [css.designer]
    if (desnContext.isShowModelFullScreen()) {
      rtn.push(css.fullScreen)
    }
    if (!myContext.showEditView) {
      rtn.push(css.hideEditView)
    }
    if (!myContext.showNavView) {
      rtn.push(css.hideNavView)
    }

    return rtn.join(' ')
  })

  const stageView = useComputed(() => {
    return myContext.loaded ? (
      <StageView key={'dblview'} content={
        myContext.pageAry && myContext.pageAry.length ? myContext.pageAry[0].content : void 0
      }/>
    ) : <div className={css.loading}>加载中...</div>
  })

  return (
    <div className={classNames}>
      <div className={css.lyNav}>
        <ComOutliner/>
      </div>
      <div className={css.lyStage}>
        {stageView}
        <ConsoleView/>
      </div>
      <div className={css.lyEdt}>
        <EditView config={config}/>
      </div>
    </div>
  )
}

function genLoadedObj(designerContext: DesignerContext, myContext: MyContext) {
  return {
    handlers: [
      {
        id: 'navView',
        get icon() {
          return myContext.showNavView ? '<' : '>'
        },
        position: 'middle',
        exe() {
          myContext.toggleNavView()
        }
      },
      {
        id: 'editView',
        get icon() {
          return myContext.showEditView ? '>' : '<'
        },
        position: 'middle',
        style: {marginLeft: 'auto'},
        exe() {
          myContext.toggleEditView()
        }
      },
      {
        id: 'switchDD',
        position: 'right',
        get style() {
          return {
            backgroundColor: '#fcc5c5'
          }
        },
        get icon() {
          return designerContext.isDebugMode() ? '设计' : '调试'
        },
        exe() {
          if (designerContext.isDesnMode()) {
            designerContext.setModeDebug()
            myContext.showNavView = false
          } else {
            designerContext.setModeDesn()
            myContext.showNavView = true
          }
        }
      }
    ].map(hd => {
      Object.defineProperty(hd, 'disabled', {
        configurable: true,
        enumerable: true,
        get() {
          return myContext.handlersDisabled
        }
      })
      return hd
    }),
    dump(): { [p: string]: {} } {
      return {
        pageAry: [{
          id: 'home',
          content: dumpPage()
        }]
      }
    }
  }
}

function importComponent(json: { id, def, title, model, geo, topl }, desnContext: DesignerContext) {
  if (!json['def']) {
    myContext.emitLogs.error('复制错误', `错误的组件数据格式.`)
    return
  }

  if (!json['id']) {//Old version
    const def = json['def']
    if (def.namespace !== 'xgraph.calculate' && def.namespace !== 'power.normal-ui-pc-v2.form') {
      myContext.emitLogs.error('复制错误', `兼容模式下只支持calculate和form组件.`)
    }

    if (def.namespace === 'xgraph.calculate') {
      _pasteCalculate(json)
    } else if (def.namespace === 'power.normal-ui-pc-v2.form') {
      _pasteForm(json, desnContext)
    }
  }

  if (!json['def'] || !json['id'] || !json['model']) {
    myContext.emitLogs.error('复制错误', `错误的组件数据格式.`)
    return
  }

  const COM_ID_MAPS = {}

  const ComBaseModelMap = {}

  function appendBaseModel(json: { id, def, title, model, geo, topl }) {
    let baseModel = ComBaseModelMap[json.id]
    if (!baseModel) {
      const all = Object.assign({}, json.def, json.model)
      baseModel = new ComSeedModel(all)

      ComBaseModelMap[json.id] = baseModel
      COM_ID_MAPS[json.id] = baseModel.id//ID maps

      //console.log(json.def.namespace,json.id,baseModel.id)

    }

    json['_baseModel'] = baseModel

    if (json.geo) {
      if (Array.isArray(json.geo.slots)) {
        json.geo.slots.forEach(slot => {
          if (Array.isArray(slot.comAry)) {
            slot.comAry.forEach(com => {
              appendBaseModel(com)
            })
          }
        })
      }
    }
    if (json.topl) {
      if (Array.isArray(json.topl.frames)) {
        json.topl.frames.forEach(frame => {
          if (Array.isArray(frame.comAry)) {
            frame.comAry.forEach(com => {
              appendBaseModel(com)
            })
          }
        })
      }
    }

  }

  appendBaseModel(json)

  json['_COM_ID_MAPS'] = COM_ID_MAPS

  myContext.emitItem.paste(json)

  return true
}

function _pasteForm(json, desnContext) {
  json['id'] = uuid()

  const comDef: T_XGraphComDef = desnContext.getComDef(json.def)
  if (!comDef) {
    myContext.emitLogs.error('复制错误', `未找到组件定义.`)
  }

  if (!json['geo']) {
    const geo = {
      id: json['id'],
      slots: void 0
    }
    if (comDef.slots) {
      geo.slots = comDef.slots.map(slot => {
        return {
          id: slot.id,
          title: slot.title
        }
      })
    }

    json['geo'] = geo
  }

  if (!json['topl']) {
    let inputPins, outputPins
    if (comDef.inputs) {
      inputPins = comDef.inputs.map(pin => {
        return {
          "id": uuid(),
          "type": "normal",
          "direction": "input",
          "hostId": pin.id,
          "title": pin.title,
          "schema": deepClone(pin.schema),
          "deletable": false
        }
      })
    }

    if (comDef.inputs) {
      outputPins = comDef.outputs.map(pin => {
        return {
          "id": uuid(),
          "type": "normal",
          "direction": "output",
          "hostId": pin.id,
          "title": pin.title,
          "schema": deepClone(pin.schema),
          "deletable": false
        }
      })
    }

    const inputs = json.model.inputAry

    const inputPinsInModel = inputs.map(pin => {
      return {
        "id": uuid(),
        "type": "normal",
        "direction": "input",
        "hostId": pin.hostId,
        "title": pin.title,
        "schema": {
          "request": [
            {
              "type": "follow"
            }
          ],
          "response": [
            {
              "type": "follow"
            }
          ]
        },
        "deletable": true
      }
    })

    const outputs = json.model.outputAry

    const outputPinsInModel = outputs.map(pin => {
      return {
        "id": uuid(),
        "type": "normal",
        "direction": "output",
        "hostId": pin.hostId,
        "title": pin.title,
        "schema": {
          "request": [
            {
              "type": "follow"
            }
          ],
          "response": [
            {
              "type": "follow"
            }
          ]
        },
        "deletable": true
      }
    })

    json['topl'] = {
      id: json['id'],
      inputPins,
      outputPins,
      inputPinsInModel,
      outputPinsInModel
    }
  }
}

function _pasteCalculate(json) {
  json.id = uuid()

  json.def = {
    namespace: 'power.normal-logic.scratch',
    rtType: 'js'
  }

  json._from_ = {
    type: "comInDiagram"
  }

  const inputs = json.model.inputAry

  const data = json.model.data

  const fns = []

  Object.keys(data.scripts).forEach(varName => {
    const inputPin = inputs.find(pin => pin.hostId === varName)

    fns.push({
      id: varName,
      title: varName === '_default_' ? '默认执行' : inputPin.title,
      vars: data.vars[varName],
      xml: data.xmls[varName],
      script: data.scripts[varName]
    })
  })

  const ndata = {
    inputCount: inputs.length,
    fns
  }

  json.model.data = ndata

  const inputPinsInModel = inputs.map(pin => {
    return {
      "id": uuid(),
      "type": "normal",
      "direction": "input",
      "hostId": pin.hostId,
      "title": pin.title,
      "schema": {
        "request": [
          {
            "type": "follow"
          }
        ],
        "response": [
          {
            "type": "follow"
          }
        ]
      },
      "conMax": 1,
      "deletable": true
    }
  })

  const outputs = json.model.outputAry

  const outputPinsInModel = outputs.map(pin => {
    return {
      "id": uuid(),
      "type": "normal",
      "direction": "output",
      "hostId": pin.hostId,
      "title": pin.title,
      "schema": {
        "request": [
          {
            "type": "follow"
          }
        ],
        "response": [
          {
            "type": "follow"
          }
        ]
      },
      "conMax": 1,
      "deletable": true
    }
  })

  json['topl'] = {
    id: json['id'],
    inputPinsInModel,
    outputPinsInModel
  }
}