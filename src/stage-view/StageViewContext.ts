/**
 * XGraph Opensource
 * This source code is licensed under the MIT license.
 * 
 * CheMingjun @2019
 * Mail:chemingjun@126.com Wechat:ALJZJZ
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