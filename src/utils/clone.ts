/**
 * XGraph Opensource
 * This source code is licensed under the MIT license.
 * 
 * CheMingjun @2019
 * Mail:chemingjun@126.com Wechat:ALJZJZ
 */

export function deepClone(obj) {
  return obj !== void 0 && obj !== null ? JSON.parse(JSON.stringify(obj)) : obj
}