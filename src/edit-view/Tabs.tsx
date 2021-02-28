/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * MyBricks team @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */

import {observe} from 'rxui';
import css from './Tabs.less';
import EditContext from './EditContext';
import {NS_Configurable} from "@sdk";

export default function NavTabs() {
  const myContext = observe(EditContext, {from: 'parents'});

  return (
    <div className={css.editTabs}>
      {myContext.catelogs && myContext.catelogs.map(
        (catelog: NS_Configurable.Category) => {
          return (
            <div key={catelog.id}
                 className={`${css.editTab} ${myContext.isActiveCatelog(catelog.id) ? css.editTabActived : null}`}
                 onClick={() => myContext.switchCatelog(catelog.id)}>
              {catelog.title}
            </div>
          )
        })}
    </div>
  )
}