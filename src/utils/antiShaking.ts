/**
 * XGraph Opensource
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * Mail:chemingjun@126.com Wechat:ALJZJZ
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
