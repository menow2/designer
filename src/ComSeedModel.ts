/**
 * MyBricks Opensource
 * This source code is licensed under the MIT license.
 *
 * MyBricks team @2019
 * Mail:mybricks@126.com Wechat:ALJZJZ
 */

import {Ignore} from 'rxui'

import BaseModel from './BaseModel'
import ComRuntimeModel from "./ComRuntimeModel";

export default class ComSeedModel extends BaseModel {
  //Copied or cutted from component
  fromId: string

  runtime: ComRuntimeModel

  // //Defination for component
  // get def(){
  //   return this.runtime.def
  // }

  forkedFrom: ComSeedModel

  /**
   * @deprecated
   */
  @Ignore
  def

  parent

  constructor(model?: ComSeedModel | ComRuntimeModel | {
    namespace: string,
    rtType?,
    title?: string,
    style?: {
      left?: number,
      top?: number,
      width?: number,
      height?: number
    },
    data?: {}
  }) {
    super()
    if (model) {
      if (model instanceof ComSeedModel) {
        this.runtime = model.runtime
      } else if (model instanceof ComRuntimeModel) {
        this.runtime = model
      } else {
        const {namespace, version, rtType, title, style, script, data, inputAry, outputAry} = model

        this.runtime = new ComRuntimeModel()//Init instance
        if (title) {
          this.runtime.title = title
        }
        this.runtime.def = {
          namespace, version, rtType
        }
        const rtModel = this.runtime.model

        if (typeof style === 'object') {
          for (const key in style) {
            //if (key !== 'width' && key !== 'height') {
              rtModel.style[key] = style[key]
            //}
          }
        }

        if (script) {
          rtModel.script = script
        }

        if (data !== void 0) {
          if (typeof data === 'object') {
            rtModel.data = data
          } else {
            throw new Error(`data in component must be an object.`)
          }
        }
        if (inputAry) {
          rtModel.inputAry = inputAry
        }
        if (outputAry) {
          rtModel.outputAry = outputAry
        }
      }
    }
  }

  get id() {
    return this.runtime?.id
  }

  get data() {
    return this.runtime?.model.data
  }

  // cutIn(model: ComBaseModel, randomPoOrOrder?: boolean | number): boolean {
  //   throw new Error(`Not implements`)
  // }
  //
  // copyIn(model: ComBaseModel, randomPoOrOrder?: boolean | number): boolean {
  //   throw new Error(`Not implements`)
  // }
}