/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * MyBricks team @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */

import {DesignerContext, NS_Emits} from "@sdk";
import StageViewModel from "./StageViewModel";

export default class StageViewContext {
  context: DesignerContext

  model: StageViewModel

  emitSnap:NS_Emits.Snap

  emitItem: NS_Emits.Component

  emitLogs: NS_Emits.Logs

  emitMessage: NS_Emits.Message

  hasGeo: boolean = false

  hasTopl: boolean = false

  loaded: boolean = false

  showComLibsPanel: Function

  routerViewAry: Function[] = []
}