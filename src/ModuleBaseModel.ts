/**
 * MyBricks Opensource
 * This source code is licensed under the MIT license.
 *
 * MyBricks team @2019
 * Mail:mybricks@126.com Wechat:ALJZJZ
 */

import ComSeedModel from "./ComSeedModel";

export default class ModuleBaseModel extends ComSeedModel {
  slot
  frame

  constructor(model, opts?: { slot, frame }) {
    super(model)
    if (opts) {
      this.slot = opts.slot
      this.frame = opts.frame
    }
  }
}