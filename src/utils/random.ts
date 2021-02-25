/**
 * XGraph Opensource
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * Mail:chemingjun@126.com Wechat:ALJZJZ
 */

export function randomNum(minNum, maxNum) {
  let fn = (n0: number, n1: number) =>
    parseInt(String(Math.random() * ((n1 !== undefined ? n1 : 2 * n0) - n0 + 1)), 10)
  return [fn(minNum, maxNum), fn(minNum, maxNum)]
}