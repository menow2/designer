/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * MyBricks team @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */

export function antiShaking() {
  let todo
  let lock
  return {
    push(fn: Function) {
      todo = fn

      if (!lock) {
        lock = 1

        setTimeout(() => {
          lock = void 0
          todo()
        })
      }
    }
  }
}
