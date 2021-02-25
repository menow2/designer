﻿/**
 * XGraph Opensource
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * Mail:chemingjun@126.com Wechat:ALJZJZ
 */

import css from './GeoCom.less';
import {observe} from "rxui";
import {ComContext} from "./GeoCom";

export default function ErrorCom({msg}: { msg: string }) {
  const {model} = observe(ComContext, {from: 'parents'})

  return (
    <div ref={el => el && (model.$el = el)}
         className={`${css.error}`}>
      {msg}
    </div>
  )
}