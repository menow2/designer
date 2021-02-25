/**
 * XGraph Opensource
 * This source code is licensed under the MIT license.
 * 
 * CheMingjun @2019
 * Mail:chemingjun@126.com Wechat:ALJZJZ
 */

export namespace NS_Listenable {
  //Handler
  export type T_Listener = {
    id?: string
    title: string //Event name
    type?: 'Default' //type
    keys?: Array<string>//Shortkeys
    exe?: Function
    items?: Array<T_Listener>
  }

  export interface I_Listenable {
    getListeners(): Array<T_Listener>
  }
}