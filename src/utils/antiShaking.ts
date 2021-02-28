/**
 * MyBricks Opensource
 * This source code is licensed under the MIT license.
 *
 * MyBricks team @2019
 * Mail:mybricks@126.com Wechat:ALJZJZ
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
