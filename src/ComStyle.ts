/**
 * MyBricks Opensource
 * This source code is licensed under the MIT license.
 *
 * MyBricks team @2019
 * Mail:mybricks@126.com Wechat:ALJZJZ
 */

import {clone, Serializable} from 'rxui'
import {SerializeNS} from "./constants";

@Serializable(SerializeNS + 'ComStyle')
export default class ComStyle {
  display: 'block' | 'inline-block' | 'none' = 'block'

  left: number

  top: number

  width: number | string

  height: number | string

  zIndex: number

  zoom: number

  marginTop: number

  marginRight: number

  marginBottom: number

  marginLeft: number

  layout: 'auto' | 'static' | 'absolute' | 'fixed' = 'auto'

  toCSS() {
    return {
      width: this.width,
      display: this.display,
      paddingTop: this.marginTop,
      paddingRight: this.marginRight,
      paddingBottom: this.marginBottom,
      paddingLeft: this.marginLeft
    }
  }

  isVisible() {
    return this.display && (this.display === 'block'||this.display === 'inline-block')
  }

  isLayoutAbsolute() {
    return this.layout && (this.layout.toLowerCase() == 'absolute'
      || this.layout.toLowerCase() == 'fixed')
  }

  isLayoutStatic() {
    return this.layout && this.layout.toLowerCase() == 'static'
  }

  setLayout(val: 'auto' | 'static' | 'absolute' | 'fixed') {
    if (typeof val === 'string' && val.match(/auto|static|absolute|fixed/gi)) {
      this.layout = val.toLowerCase() as any
    }
  }

  clone() {
    const rtn = new ComStyle()
    for (const name in this) {
      rtn[name] = this[name]
    }
    const obj = clone(this)
    Object.assign(rtn, obj)

    return rtn
  }
}