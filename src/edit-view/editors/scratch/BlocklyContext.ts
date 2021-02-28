/**
 * MyBricks Opensource
 * This source code is licensed under the MIT license.
 *
 * MyBricks team @2019
 * Mail:mybricks@126.com Wechat:ALJZJZ
 */

import {DesignerContext} from "@sdk";

type T_Output = { id: string, title: string }

type T_Fn = {
  id: string
  title: string
  input: string
  outputs: T_Output[]
  vars: { id, name, type }[]
  xml: string
  script: string
}

export default class BlocklyContext {
  private _designerContext: DesignerContext

  private fns: T_Fn[]

  ready: boolean = false

  curFn: T_Fn

  value: { get, set }

  startBlocks:{[id:string]:string}

  blocksDef: {}[]

  inputEle: HTMLElement

  showMenu: boolean = false

  mode: 'runtime' | 'debug' = 'runtime'

  workspace

  closeView

  isModeDebug() {
    return this.mode === 'debug'
  }

  setCurFn(fn: T_Fn) {
    this.curFn = fn
  }

  getFns(): T_Fn[] {
    return this.fns
  }

  getCurOutputs(): T_Output[] {
    return this.curFn.outputs
  }

  getCurVars() {
    return this.curFn.vars
  }

  addVar(name, id?, type?) {
    if (!this.curFn.vars) {
      this.curFn.vars = []
    }
    if (!this.curFn.vars.find(({name: tname}) => tname === name)) {
      this.curFn.vars.push({id, name, type})
    }
  }

  setCurVars(varAry: []) {
    this.curFn.vars = varAry
  }

  getCurXml() {
    return this.curFn.xml
  }

  setCurXml(xml: string) {
    this.curFn.xml = xml
  }

  getCurScript() {
    return this.curFn.script
  }

  setCurScript(script: string) {
    this.curFn.script = script
  }

  getEnvVarScript(varName, args) {
    const tname = varName.replace(/\b(\w)|\s(\w)/g, m => {
      return m.toUpperCase();
    })
    const fn = this._designerContext.envVars.scripts[`get${tname}`]
    if (!fn) {
      throw new Error(`No env varName(${varName}) defined.`)
    }
    return fn(...args)
  }

  getEnvVarDebugValue(varName) {
    return this._designerContext.envVars.debug[varName]
  }

  createBlock(type: string, options, shadow?) {
    const th = this
    let rtnBlock

    if (type === 'variables_get') {
      const oriFn = Blockly.FieldVariable.prototype.initModel

      Blockly.FieldVariable.prototype.initModel = function () {
        if (this.variable_) {
          return; // Initialization already happened.
        }

        const variable = Blockly.Variables.getOrCreateVariablePackage(
          this.sourceBlock_.workspace, null,
          (options ? options.name : void 0) || th.curInput.hostId, this.defaultType_)

        this.doValueUpdate_(variable.getId())
      }

      rtnBlock = this.workspace.newBlock('variables_get')

      rtnBlock.initSvg()
      rtnBlock.render()

      Blockly.FieldVariable.prototype.initModel = oriFn
    } else {
      rtnBlock = this.workspace.newBlock(type)

      rtnBlock.initSvg()
      rtnBlock.render()
    }

    if (shadow) {
      rtnBlock.setShadow(true)
    }
    return rtnBlock
  }

  logDebug(content: string, style?: string) {
    content = JSON.stringify(content)
    return style ? `_debugLog([${content}],${style})` : `_debugLog([${content}])`
  }
}