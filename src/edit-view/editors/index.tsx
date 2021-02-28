/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * MyBricks team @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */

import Text from './text'
import RichText from './richtext'
import InputNumber from './inputNumber'
import Button from './button'
import Textarea from './textarea'
import Select from './select'
import Switch from './switch'
import Slider from './slider'
import Radio from './radio'

import List from './list'

import ColorPicker from './colorpicker'

import Scratch from "./scratch";

import {NS_EditorsDefault} from "@sdk";

const editors = {}

reg(NS_EditorsDefault.TEXT, Text)
reg(NS_EditorsDefault.RICHTEXT, RichText)
reg(NS_EditorsDefault.INPUTNUMBER, InputNumber)
reg(NS_EditorsDefault.BUTTON, Button)
reg(NS_EditorsDefault.TEXTAREA, Textarea)
reg(NS_EditorsDefault.SELECT, Select)
reg(NS_EditorsDefault.SWITCH, Switch)
reg(NS_EditorsDefault.SLIDER, Slider)
reg(NS_EditorsDefault.RADIO, Radio)

reg(NS_EditorsDefault.LIST, List)

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