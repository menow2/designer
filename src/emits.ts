/**
 * MyBricks Opensource
 * This source code is licensed under the MIT license.
 *
 * MyBricks team @2019
 * Mail:mybricks@126.com Wechat:ALJZJZ
 */

import BaseModel from './BaseModel';
import ComSeedModel from "./ComSeedModel";
import ComRuntimeModel from './ComRuntimeModel'
import {
  I_ConModel,
  I_FrameModel,
  I_PinModel,
  T_ComDef,
  T_Module,
  T_Outliner,
  T_PinSchema
} from "./types";

export namespace NS_Emits {
  export class Snap {
    start: {
      (action: string,
       listener?: { (target: object, propName: string, value: any): void })
        : { commit: { (): void }, wait: { (): void }, cancel: { (): void } }
    }
  }

  export class Message {
    info: { (content: string): any }
    warn: { (content: string): any }
    error: { (content: string): any }
    trace: { (content: string): any }
  }

  export class Page {
    getPage: (pageId: string) => { render: () => {} }
  }

  export class Module {
    load: (module: T_Module) => void
    clearAllTempComs: () => void
  }

  export class Views {
    hideNav: () => boolean

    showNav: () => boolean

    disableHandlers: () => boolean

    enableHandlers: () => boolean

    focusStage: ({outlines}: { outlines: T_Outliner[] }) => boolean

    pushInStage: (Function) => void

    popInStage: () => boolean

    getCurRootFrame: () => I_FrameModel
  }

  export class Component {
    exist: (def: T_ComDef, instId: string) => { id: string, result: boolean, info: string }

    hover: <T extends BaseModel>(model: T | null) => any

    focus: (obj: {} | {}[] | null) => any

    reFocus: (model?: BaseModel) => any

    blur: (obj?: {}) => any

    focusFork: <T extends BaseModel>(model: T) => boolean

    add: (instanceModel: ComSeedModel,//defined in using
          state: 'ing' | 'finish' | 'cancel',
          opts?: { json: {} }
          //from?: BaseItem<BaseModel>//The source(view) of the event
    ) => string

    addSlot: (comId: string, slotId: string, slotTitle?: string, type?: 'scope' | undefined) => boolean

    setSlotTitle: (comId: string, slotId: string, slotTitle: string) => boolean

    removeSlot: (comId: string, slotId: string) => boolean

    move: <T extends BaseModel>(model: T,
                                state: 'start' | 'ing' | 'finish',
                                position?: { x: number, y: number },
                                suggest?: Function) => any

    resize: <T extends BaseModel>(model: T,
                                  state: 'start' | 'ing' | 'finish',
                                  suggest?: Function) => any

    cutToSlot: (fromComId: string, toComId: string, toSlotId: string, order?: number) => boolean

    paste: (json) => string

    delete: <T extends BaseModel>(item: T) => boolean

    upgrade: (comBaseModel: ComSeedModel) => boolean

    editDiagram: (comId: string, outputHostId?: string) => boolean
    //-------------------------------------------------------------------

    connected: (connection: I_ConModel) => boolean

    disConnected: (connection: I_ConModel) => boolean

    hintPins: (model: I_PinModel) => boolean

    assistWithPin: (model: I_PinModel) => boolean
  }

  //Debug
  export class Debug {
    setComDebug: (scopePath: string, frameLable: string | number, instanceId: string, {
      inputs: {},
      outputs: {},
      frames: {}
    }, comDef: T_ComDef) => ComRuntimeModel

    stop: () => void
  }

  export class Logs {
    info: (catelog: string, content?: string, focus?: Function, blur?: Function) => void
    warn: (catelog: string, content?: string, focus?: Function, blur?: Function) => void
    error: (catelog: string, content?: string, focus?: Function, blur?: Function) => void
  }

  export class IOEditor {
    getInput: (instId) => {
      get: (id: string) => { id: string, name: string } | { id: string, name: string }[]
      add: (pinId, title, paramRules: T_PinSchema, deletable?: boolean, conMax?: number | null) => object
      rename: (pinId, title) => boolean
      setSchema: (pinId, paramRules: T_PinSchema) => boolean
      remove: (pinId) => boolean
    }

    getOutput: (instId) => {
      get: (id: string) => { id: string, name: string } | { id: string, name: string }[]
      add: (pinId, title, paramRules: T_PinSchema, deletable?: boolean, conMax?: number | null) => object
      rename: (pinId, title) => boolean
      setSchema: (pinId, paramRules: T_PinSchema) => boolean
      remove: (pinId) => boolean
    }
  }
}
