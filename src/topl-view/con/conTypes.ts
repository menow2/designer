/**
 * MyBricks Opensource
 * This source code is licensed under the MIT license.
 *
 * MyBricks team @2019
 * Mail:mybricks@126.com Wechat:ALJZJZ
 */

export type T_Controller = {
  x?: number
  y?: number
  type: 'h' | 'v'
  endPoints: Array<T_Po>
  allPoints: Array<T_Po>
}
export type T_Po = {
  id?: string
  x: number
  y: number
  j?: number
  temp?: boolean
  d?: 'h' | 'v'
  fixed?: boolean
}