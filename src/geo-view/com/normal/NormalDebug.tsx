/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * MyBricks team @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */

import {observe, useComputed} from "rxui";
import css from "./NormalDebug.less";
import {useMemo} from "react";
import {ComContext} from "../GeoCom";
import {getEnv, getStyle} from "../comCommons";
import Slot from "../../slot/Slot";
import {refactorStyle} from "../../geoUtil";
import GeoComDebugModel from "../GeoComDebugModel";

export default function NormalDebug() {
  const comContext = observe(ComContext, {from: 'parents'})
  const {comDef, model, context} = comContext
  const style = useComputed(computeStyle)

  // useEffect(() => {
  //   let comEle = model.$el;
  //   comEle.querySelectorAll('a[href]').forEach(alink => {
  //     alink['href'] = 'javascript:void(0);'
  //   })
  // }, [])

  const dmodel = model as GeoComDebugModel

  // if(dmodel.runtime.def.namespace.endsWith('normal')){
  //   debugger
  //   console.log('=====',dmodel.inputs['__id__'])
  // }

  //console.log(dmodel.runtime.defaultFrameLabel,dmodel.runtime.scopePath)
  const rt = useMemo(() => {//Avoid refresh component twice when style(display='block' eg) changed
    return comDef.runtime
      && <comDef.runtime key={dmodel.id}
                         data={dmodel.data}
                         env={getEnv(model, comContext)}
                         slots={renderSlots(dmodel)}
                         style={getStyle()}
                         inputs={dmodel.inputs}
                         outputs={dmodel.outputs}/>
  }, [])

  return <div ref={el => model.$el = el}
              style={style}
              className={css.debug}>
    {rt}
  </div>
}

function computeStyle() {
  const comContext = observe(ComContext)
  const {model, context, emitItem, emitSnap, comDef} = comContext

  const css = model.style.toCSS()
  let sty = {}
  for (let nm in css) {
    sty[nm] = css[nm]
  }

  const {left, top, width, height} = model.style

  if (context.isDesnMode()) {
    sty = Object.assign(sty, model.style.isLayoutAbsolute() ? {
      // transform: model.isLayoutAbsolute() ?
      //   `translateY(${model.position.y}px) translateX(${model.position.x}px)` : '',
      zIndex: 1,
      position: 'absolute',
      left: left + 'px',
      top: top + 'px',
      width: width + 'px',
      height: height + 'px'
    } : {
      //height: height ? (height + 'px') : undefined
    })
  } else {
    sty = Object.assign(sty, model.style.isLayoutAbsolute() ? {
      zIndex: 1,
      position: 'absolute',
      left: left + 'px',
      top: top + 'px',
      width: width + 'px',
      height: height + 'px'
    } : {})
  }

  refactorStyle(sty)
  return sty
}

function renderSlots(model: GeoComDebugModel) {
  if (model.slots) {
    const rst = {}

    model.slots.forEach(slot => {
      rst[slot.id] = {
        id: slot.id,
        title: slot.title,
        render(data?: {}, key?: string) {
          // if(!frameLable){
          //   frameLable = model.runtime.defaultFrameLabel
          // }

          const frame = model.frames[slot.id]
          let scopePath
          if (frame) {
            scopePath = frame(data, key !== void 0 ? (key + '') : key)
          }

          //
          // if (frameLable !== void 0) {//Frame in frame
          //   debugger
          //   frameLable = model.runtime.scopePath + ':' + frameLable//Add namespace
          // } else {
          //   frameLable = UNDEFINED_FRAME_LABEL
          // }

          //console.log(slot.renderKey)

          return <Slot key={slot.renderKey} model={slot} frameLable={key} scopePath={scopePath}/>
        }
      }
    })
    return rst
  }
}