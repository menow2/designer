/**
 * MyBricks Opensource
 * This source code is licensed under the MIT license.
 *
 * MyBricks team @2019
 * Mail:mybricks@126.com Wechat:ALJZJZ
 */

import {observe, uuid} from "rxui";
import {ComContext} from "./GeoCom";
import {ModuleSeedModel} from "@sdk";
import GeoComDebugModel from "./GeoComDebugModel";
import {GeoComModel} from "./GeoComModel";
import React from "react";

export function getEnv(model: GeoComModel, comContext: ComContext) {
  const {context, emitPage, emitItem,emitModule} = comContext
  return {
    edit: context.isDesnMode(),
    get runtime() {
      if (context.isDebugMode()) {
        return Object.assign({
          debug: {},
          getUserToken() {
            return context.envVars.debug.userToken
          },
          getEnvType() {
            return context.envVars.debug.envType
          },
          getEnvParam(name: string) {
            const params = context.envVars.debug.envParams
            if (typeof params === 'string') {
              let obj
              try {
                eval(`obj = ${params}`)
              } catch (ex) {
                throw new Error(`解析环境参数错误:${ex.message}`)
              }
              return obj[name]
            }
          }
        }, context.configs.envAppenders?.runtime)
      } else {
        return false
      }
    }
  }
}

export function getStyle(debug?: GeoComDebugModel) {
  const {model, context, emitItem, emitSnap} = observe(ComContext)
  if (debug) {
    return {
      get display() {
        return debug.style.display
      },
      set display(val: 'block' | 'none') {
        if (typeof (val) !== 'string' || !val.match(/block|none/g)) {
          throw new Error(`Invalid value`)
        }
        debug.style.display = val
      }
    }
  } else {
    return {
      get display() {
        return model.style.display
      },
      set display(val: 'block' | 'none') {
        if (typeof (val) !== 'string' || !val.match(/block|none/g)) {
          throw new Error(`Invalid value`)
        }
        model.style.display = val
      },
      /**
       * @description 由于部分组件宽度动态，根据布局的需要，开放组件根节点宽度设置
       * @author 朱鹏强
       * @time 2021/02/01
       * **/
      get width() {
        return model.style.width
      },
      set width(val) {
        model.style.width = val
      },
    }
  }
}

export function getInputs() {
  const {model, context, emitItem, emitSnap} = observe(ComContext)
  return new Proxy({}, {
    get(target: {}, _id: PropertyKey, receiver: any): any {
      return function () {
      }
    }
  })
}

export function getOutputs() {
  const {model, context, emitItem, emitSnap} = observe(ComContext)
  return new Proxy({}, {
    get(target: {}, _id: PropertyKey, receiver: any): any {
      return function () {
      }
    }
  })
}