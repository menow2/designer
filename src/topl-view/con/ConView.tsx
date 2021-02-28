/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * MyBricks team @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */

import css from './ConView.less'
import Con from "./Con";
import {useComputed, useObservable} from "rxui";
import FrameModel from "../frame/FrameModel";
import {T_Po} from "./conTypes";
import DiagramModel from "../frame/diagram/DiagramModel";
import {getPosition} from '@utils';

export class ConViewContext {
  contextPoints: { [id: string]: Array<T_Po> } = {}
}

export default function ConView({frameModel}: { frameModel: FrameModel|DiagramModel }) {
  useObservable(ConViewContext, {to: 'children'})

  const classes = useComputed(() => {
    // if (frameModel.focusModelAry && frameModel.focusModelAry.find(item => item instanceof ToplComModel)) {
    //   return css.focusCom
    // }
    return css.normal
  })

  /**
   * @description 布局试图删除一个outputs输出口，功能正常使用，修复逻辑试图中连线断开问题（ui）
   * @author 梁李昊
   * @time 2021/02/05
   * **/
  const cons = useComputed(() => {
    // 兼容老版本逻辑以及非ui组件逻辑视图
    if (frameModel.name === 'topl' || !frameModel.startFrom?.outputPinsInModel) {
      return frameModel.conAry.map((md, idx) => {
        return <Con key={md.id} model={md}/>
      })
    } else {
      const resCons = getCons({frameModel})
      return resCons
    }
  })
  // const cons = useComputed(() => {
  //   return frameModel.conAry.map((md, idx) => {
  //       return <Con key={md.id} model={md}/>
  //     }
  //   )
  // })

  return (
    <svg className={`${classes} ${css.conView}`}>
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="10" refX="2" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" className={css.arrow}/>
        </marker>
        <marker id={`arrowR`} markerWidth="8" markerHeight="10" refX="0" refY="2" orient="auto">
          <path d="M0,0 L0,4 L3,2 z" className={css.running}/>
        </marker>
        <marker id={`arrowE`} markerWidth="8" markerHeight="10" refX="0" refY="2" orient="auto">
          <path d="M0,0 L0,4 L3,2 z" className={css.error}/>
        </marker>
      </defs>
      {cons}
    </svg>
  )
}

function getCons({frameModel}: {frameModel: FrameModel|DiagramModel}) {
  const resCons = frameModel.conAry.map(md => {
    if (md.startPin?.$el?.parentNode) {
      const viewPo = getPosition(md.parent.$el)
      const pinDom = md.startPin.$el
      if (pinDom) {
        const pinPo = getPosition(pinDom)
        const startPo = {
          x: pinPo.x + pinDom.offsetWidth - viewPo.x,
          y: pinPo.y + pinDom.offsetHeight / 2 - viewPo.y,
          j: md.startPin.getJoinerWidth()
        }
        md.startPo = startPo
      }
    }
    return <Con key={md.id} model={md}/>
  })
  return resCons
}