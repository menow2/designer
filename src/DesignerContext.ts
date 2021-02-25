/**
 * XGraph Opensource
 * This source code is licensed under the MIT license.
 * 
 * CheMingjun @2019
 * Mail:chemingjun@126.com Wechat:ALJZJZ
 */

import {BaseModel, T_DesignerConfig, T_ExtComDef, T_XGraphComDef, T_XGraphComLib} from '@sdk'
import {Arrays, versionGreaterThan} from "./utils";

export type T_Focusable = {
  focus: () => {}
  blur: () => {}
  getConfigs: () => any
  getListeners: () => any
}

export default abstract class DesignerContext {
  static DESIGNER_VERSION: number = 0.2

  private mode: 'Desn' | 'Debug' = 'Desn'

  private showMode: 'normal' | 'fullscreen' = 'normal'

  focusDefault: T_Focusable

  focusModelAry: Array<T_Focusable> = []

  focus(model: T_Focusable) {
    if (this.focusModelAry.indexOf(model) !== -1) {
      return
    }
    this.reFocus(model)
  }

  reFocus(model: T_Focusable) {
    this.blur()
    if (typeof model === 'object' && model) {
      if (typeof model.focus === 'function') {
        model.focus()
      }
      this.focusModelAry.push(model)
    }
  }

  blur() {
    this.focusModelAry.forEach(model => {
      if (typeof model.blur === 'function') {
        model.blur()
      }
    })
    this.focusModelAry = []
  }

  getMode() {
    return this.mode
  }

  isDesnMode() {
    return this.mode === 'Desn'
  }

  setModeDesn() {
    this.mode = 'Desn'
  }

  isDebugMode() {
    return this.mode === 'Debug'
  }

  setModeDebug() {
    this.mode = 'Debug'
  }

  isShowModelFullScreen() {
    return this.showMode === 'fullscreen'
  }

  setShowModelFullScreen() {
    this.showMode = 'fullscreen'
  }

  setShowModelNormal() {
    this.showMode = 'normal'
  }

  _designerVersion: number = 0

  get useLatestFeatures() {
    const mode = this.configs.mode
    if (mode && mode === 'dev') {
      return false
    }
    return this._designerVersion >= DesignerContext.DESIGNER_VERSION
  }

  //----------------------------------------------------------------------------

  private _configs: T_DesignerConfig

  get configs() {
    return this._configs
  }

  set configs(cfg: T_DesignerConfig) {
    const th = this
    if (!th._configs) {
      if (!cfg.comlibLoader || typeof cfg.comlibLoader !== 'function') {
        throw new Error(`Invalid comlibLoader config.`)
      }
      th._configs = Object.assign({stage: {type: 'pc'}}, cfg, {
        comlibLoader() {
          return new Promise(resolve => {
            cfg.comlibLoader().then(libs => {
              th.comLibAry = libs
              resolve(libs)
            })
          })
        }
      })
    }
  }

  appendConfigs(key: string, vals: any) {
    if (!this._configs[key]) {
      this._configs[key] = vals
    }
  }

  //----------------------------------------------------------------------------

  //Component libs for desn
  comLibAry: Array<T_XGraphComLib>

  addComLib(nlib) {
    if (this.comLibAry.find(lib => lib.id === nlib.id)) {
      return
    }
    this.comLibAry.push(nlib)
  }

  // getExtComDef(pointId: string, instId: string): T_ExtComDef {
  //   let extPoint
  //   const extDesc = this.configs.extComDef.find(ep => ep.pointId === pointId)
  //   if (extDesc && extDesc.comAry) {
  //     return extDesc.comAry.find(ep => ep.id === instId) as T_ExtComDef
  //   }
  // }

  getComDef(def: { namespace: string, version?: string }): T_XGraphComDef {
    if (this.comLibAry) {
      const rst = []
      this.comLibAry.forEach(lib => {
        if (lib.comAray) {
          lib.comAray.find(com => {
            if (Array.isArray(com.comAray)) {//catelog
              return com.comAray.forEach(com => {
                if (com.namespace === def.namespace) {
                  rst.push(com)
                  rst.push(com)
                }
              })
            } else {
              if (com.namespace === def.namespace) {
                rst.push(com)
                rst.push(com)
              }
            }
          })
        }
      })

      if (rst.length > 0) {
        rst.sort((a, b) => {
          return versionGreaterThan(a.version, b.version)
        })

        return rst[0]
      }
    }
  }

  //----------------------------------------------------------------------------

  envVars = {
    scripts: {
      getUserToken() {
        return `_envVars_.getUserToken()`
      },
      getEnvType() {
        return `_envVars_.getEnvType()`
      },
      getEnvParam(name: string) {
        return `_envVars_.getEnvParam('${name}')`
      }
    },
    debug: {
      userToken: void 0,
      envType: void 0,
      envParams: void 0
    }
  }
}
