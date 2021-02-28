/**
 * MyBricks Opensource
 * This source code is licensed under the MIT license.
 *
 * MyBricks team @2019
 * Mail:mybricks@126.com Wechat:ALJZJZ
 */

import {ignore, Ignore, Serializable} from 'rxui'

import SlotModel from './SlotModel';

import {SerializeNS, VIEW_GEO_NAME} from '../constants';
import {GeoComModel} from "../com/GeoComModel";

@Serializable(SerializeNS + 'geo.GeoViewModel')
export default class GeoViewModel extends SlotModel {
  name: string = VIEW_GEO_NAME

  displayType: 'dialog' | undefined

  @Ignore
  selectZone: { x, y, w, h, models }

  @Ignore
  comsAddedInDebug: [GeoComModel] = []

  constructor(id?: string, title?: string) {
    super(id, title)
  }

  addDebugTempCom(com: GeoComModel) {
    ignore(com)
    this.comsAddedInDebug.push(com)
  }

  clearAllTempComs() {
    this.comsAddedInDebug.forEach(com => {
      this.delete(com)
    })
  }
}
