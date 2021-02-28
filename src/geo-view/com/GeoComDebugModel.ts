/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * MyBricks team @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */

import {GeoComModel} from './GeoComModel';

export default class GeoComDebugModel extends GeoComModel {
  // _id
  //
  // constructor(id) {
  //   super()
  //   this._id = id
  // }

  // get id() {
  //   return this._id
  // }

  inputs: { [index: string]: any }

  outputs: { [index: string]: (data) => any }

  frames: { [index: string]: (data, key?) => any }
}
