/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * MyBricks team @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */

import css from './ComOutliner.less';
import {Fragment} from 'react';
import {observe, useObservable} from 'rxui';
import {NS_Emits,ICON_COM_DEFAULT} from '@sdk';

export type ComItem = {
  id: string;
  title: string;
  visible: boolean;
  active: boolean;
  icon: string;
  model: any;
  items: ComItem[];
  focus(): boolean
  switchView(): boolean
  hasUI: boolean
  mocking: boolean
  isModule: boolean
  label: 'todo' | undefined
  curFrame: string;
}

export class ComOutlinerContext {
  coms: ComItem[] = [];
}

export default function ComOutliner() {
  const outlinerContext = useObservable(ComOutlinerContext);

  observe(NS_Emits.Views, next => next({
    focusStage({outlines}) {
      outlinerContext.coms = outlines as any;
    }
  }), {from: 'parents'});

  return (
    <div className={css.layout}>
      <div className={css.titleBar}>
        组件
      </div>
      <div className={css.inner}>
        <RenderComs coms={outlinerContext.coms} top={true}/>
        {/*<NoRenderComs coms={outlinerContext.coms}/>*/}
      </div>
    </div>
  )
}

function RenderComs({coms, top = false}: { coms: ComItem[], top: boolean }) {
  return (
    <div className={css.comList} style={{marginLeft: top ? 0 : 15}}>
      {coms.map((com: ComItem) => {
        return (
          <RenderCom key={com.id} com={com}/>
        )
      })}
    </div>
  )
}

function NoRenderComs({coms, top = false}: { coms: ComItem[], top: boolean }) {
  return (
    <div className={css.noRenderComList}>
      {coms.map((com: ComItem) => {
        return (
          <RenderCom key={com.id} com={com}/>
        )
      })}
    </div>
  )
}

function RenderCom({com}: { com: ComItem }) {
  return (
    <Fragment>
      <div className={`${com.active ? css.comItemActive : css.comItem} 
                       ${!com.visible ? css.comItemHide : ''}
                       ${!com.hasUI ? css.noUI : ''}
                       ${com.isModule ? css.module : ''}
                       ${com.label ? css.labelTodo : ''}
                       ${com.mocking ? css.mocking : ''}
                       `
      }
           onClick={com.focus}
           onDoubleClick={com.switchView}>
        {/* <i
          className={css.comIcon}
          style={{backgroundImage: com.icon === './icon.png' ? '' : `url(${com.icon})`}}
        /> */}
        <img
          className={css.comIcon}
          src={(com.icon === './icon.png' || !/^(https:)/.test(com.icon)) ? ICON_COM_DEFAULT : com.icon}
          height={16}
        />
        <div className={css.comItemContent}>
          <span className={css.comName}>
            {com.title}
            <span>
              {com.isModule ? '模块' : ''}
            </span>
          </span>
          <span className={css.comInfo}>
            {/*{!com.visible && '(隐藏)'}*/}
          </span>
          {/*<span className={css.comInfo}>*/}
          {/*  {com.curFrame && `(${com.curFrame.title})`}*/}
          {/*</span>*/}
        </div>
      </div>
      {com?.items.length > 0 && (
        <RenderComs coms={com.items}/>
      )}
    </Fragment>
  )
}