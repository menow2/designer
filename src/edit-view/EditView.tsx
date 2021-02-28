/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * MyBricks team @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */

import {observe, useComputed, useObservable} from "rxui";
import {DesignerContext, NS_Configurable} from '@sdk'
import EditContext from './EditContext';
import EditTabs from './Tabs';
import EditCatelog from './Catelog';

export default function EditView() {
  const context = observe(DesignerContext, {from: 'parents'})
  const myContext = useObservable(EditContext, next => next({
    context
  }), {to: 'children'})

  useComputed(() => {
    let fmodel
    if (context.focusModelAry.length == 0) {
      fmodel = context.focusDefault
    }
    if (context.focusModelAry.length == 1) {
      fmodel = context.focusModelAry[0]
    }
    if (fmodel && typeof fmodel.getConfigs === 'function') {
      const catelogs = fmodel.getConfigs()
      myContext.setCatelogs(catelogs)
    }
  })

  // const initContext = useCallback(() => {
  //   const groupItems = config.stage?.bgConfig
  //
  //   myContext.activeCateId = 'tab_0'
  //   myContext.setCatelogs([{
  //     title: '项目',
  //     id: myContext.activeCateId,
  //     groups: [{
  //       items: groupItems
  //     }]
  //   }] as any)
  // }, [])
  //
  // useEffect(() => {
  //   initContext()
  // }, [])

  // observe(NS_Emits.Component, (next: any) => {
  //   next({
  //     focus(model: I_Configurable) {
  //       if (typeof model?.getConfigs === 'function') {
  //         const catelogs = model.getConfigs()
  //
  //         myContext.setCatelogs(catelogs)
  //         //myContext.setData(contextData)
  //
  //         // setTimeout(() => {
  //         //   context.setData(contextData)
  //         // }, 0)
  //       }
  //     }
  //   })
  // }, {'from': 'parents'})

  return (
    <>
      <EditTabs/>
      {
        myContext.catelogs && myContext.catelogs.map(
          catelog => <EditCatelog key={catelog.id} catelog={catelog}/>
        )
      }
    </>
  )
}