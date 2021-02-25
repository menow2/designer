/**
 * XGraph Opensource
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * Mail:chemingjun@126.com Wechat:ALJZJZ
 */

import Text from './text'
import InputNumber from './inputNumber'
import Button from './button'
import Textarea from './textarea'
import Select from './select'
import Switch from './switch'
import Slider from './slider'
import Radio from './radio'

import ColorPicker from './colorpicker'

import Scratch from "./scratch";

import {NS_EditorsDefault} from "@sdk";

const editors = {}

reg(NS_EditorsDefault.TEXT, Text)
reg(NS_EditorsDefault.INPUTNUMBER, InputNumber)
reg(NS_EditorsDefault.BUTTON, Button)
reg(NS_EditorsDefault.TEXTAREA, Textarea)
reg(NS_EditorsDefault.SELECT, Select)
reg(NS_EditorsDefault.SWITCH, Switch)
reg(NS_EditorsDefault.SLIDER, Slider)
reg(NS_EditorsDefault.RADIO, Radio)

reg(NS_EditorsDefault.COLORPICKER, ColorPicker)

reg(NS_EditorsDefault.SCRATCH, Scratch)

function reg(type, Editor) {
  editors[type] = function (arg) {
    const {type, options, ele} = arg
    const st = Editor.showTitle
    return {
      render() {
        return <Editor {...arg}/>
      },
      showTitle: typeof st === 'function' ?
        st(arg) : (st === void 0 ? true : st)
    }
  }
}

export default function (arg) {
  const {type, options, ele} = arg

  const editor = editors[(type as string).toUpperCase()]
  if (editor) {
    return editor(arg)
  } else {
    console.warn(`Editor type ${type} not found.`)
  }

}