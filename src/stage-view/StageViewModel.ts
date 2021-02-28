/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * MyBricks team @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */

import {Serializable} from "rxui";
import {SerializeNS} from "./constants";
import {BaseModel, T_Module} from "@sdk";

@Serializable(SerializeNS + `StageViewModel`)
export default class StageViewModel extends BaseModel {
  designerVersion:number = 0.1

  mainModule: T_Module

  moduleNav: T_Module[] = []

  envVars: {
    envType: string
    userToken: string
    envParams: string
  } = {}

  getCurModule(): T_Module {
    return this.moduleNav.length > 0 ? this.moduleNav[this.moduleNav.length - 1] : void 0
  }

  pushModule(module: T_Module) {
    this.moduleNav.push(module)
  }

  popModule() {
    return this.moduleNav.pop()
  }
}