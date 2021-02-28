/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * MyBricks team @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */

import css from './DesnView.less';

import {dragable, evt, observe, useComputed, useObservable, useWatcher} from 'rxui';
import React, {useEffect, useMemo} from 'react';
import {ViewCfgDefault} from '../config';

import GeoCom from '../com/GeoCom';
import Mask from './Mask';
import {GeoViewContext, scrollFix} from './GeoView';
import {NS_Emits} from "@sdk";
import GeoViewModel from "./GeoViewModel";
import {getEmitItem, getOutliners} from "./desnViewInit";
import {get as getConfiguration} from './configrable'
import SlotModel from "./SlotModel";

export default function DesnView({viewModel}: { viewModel: GeoViewModel }) {
  const wrapStyle = useObservable({maxHeight: 0})

  const emitView = useObservable(NS_Emits.Views, {expectTo: 'parents'})

  const viewCtx = observe(GeoViewContext, {from: 'parents'})

  const {placeholder, context, emitItem, emitSnap} = viewCtx

  useWatcher(viewModel, 'comAry', (prop, val, preVal) => {
    if (viewModel.state.isEnabledOrAbove()) {
      //setTimeout(() => {//Performance
      emitView.focusStage({
        outlines: getOutliners(viewCtx)
      })
      //})
    }
  })

  useComputed(() => {
    init(wrapStyle)
    if (viewModel.state.isEnabledOrAbove()) {
      emitView.focusStage({
        outlines: getOutliners(viewCtx)
      })
    }
  })

  // useEffect(() => {
  //   if (viewCtx.config?.overflowY?.toLowerCase() == 'auto') {
  //     let element = viewCtx.viewModel.$el;
  //     // if (window['ResizeObserver']) {
  //     //   (new window['ResizeObserver']((mutationList) => {
  //     //     // let width = getComputedStyle(element).getPropertyValue('width')
  //     //     // let height = getComputedStyle(element).getPropertyValue('height')
  //     //     wrapStyle.maxHeight = element.clientHeight
  //     //   })).observe(element, {
  //     //     attributes: true,
  //     //     attributeFilter: ['style'],
  //     //     attributeOldValue: true
  //     //   })
  //     // }
  //   }
  //   // return function unload() {
  //   //   viewModel.unload()
  //   // }
  // }, [])

  useEffect(() => {
    if (viewModel.state.isEnabled()) {
      scrollFix(viewModel)
      // if (!viewModel.focusModelAry?.length) {
      //   click()
      // }
    }
  }, [viewModel.state.isEnabled()])

  useEffect(() => {
    // viewModel.$el.parentNode.parentNode.addEventListener('wheel', function (evt) {
    //   wrapWheel(() => {
    //     wheel(evt, viewModel)
    //   })(evt)
    //
    //   //evt.preventDefault()
    // }, {passive: false})

    const validateSlot = (slotModel: SlotModel) => {
      if (slotModel.comAry) {
        slotModel.comAry.forEach(com => {
          emitItem.exist(com.runtime.def, com.id)
          if (com.slots) {
            com.slots.forEach(slot => validateSlot(slot))
          }
        })
      }
    }

    validateSlot(viewModel)
    return () => {

    }
  }, [])

  const wrapViewStyle = useComputed(() => computeWrapViewStyle(wrapStyle))
  const zoomViewStyle = useComputed(computeZoomViewStyle)

  const moverStyle = useComputed(() => (
    {
      display: viewCtx.mover.x !== void 0 ? 'block' : 'none',
      left: viewCtx.mover.x,
      top: viewCtx.mover.y
    }))

  /**
   * @description display:none导致dom位置计算错误
   * @author 梁李昊
   * @time 2021/02/05
   * **/
  const viewWrapStyle = useComputed(() => {
    const isEnabled = viewModel.state.isEnabled()
    return {
      height: isEnabled ? '100%' : 0,
      opacity: isEnabled ? 1 : 0
    }
  })

  return (
    <div className={css.viewWrap} 
        // style={{display: viewModel.state.isEnabled() ? 'block' : 'none'}}
      style={viewWrapStyle}
      onClick={clickWrap}
      onScroll={scroll}
      // onWheel={e => wheel(e, viewModel)}
    >
      <div style={wrapViewStyle}
           className={`${css.geoView} ${viewModel.state.isHovering() ? css.geoViewHover : ''}`}
           onClick={evt(click).stop}>
        <div style={zoomViewStyle}
             className={`${css.zoomView} 
                       ${viewModel.style.isLayoutAbsolute() ? css.zoomViewAbsolute : css.zoomViewFlow}`}
             ref={el => el && (viewModel.$el = el)}>
          {viewModel.comAry.map((md, idx) => {
              // if(md.id==='u_n3r49d'){
              //   debugger
              // }
              return <GeoCom key={md.id} model={md}/>
            }
          )}
          <Mask/>
          <div className={css.placeholder}
               style={{
                 display: `${placeholder.y !== void 0 ? 'block' : 'none'}`,
                 top: placeholder.y,
                 left: placeholder.x,
                 width: placeholder.w
               }}>
            <div/>
          </div>
        </div>
        <div className={css.mover}
             style={moverStyle}/>
      </div>
    </div>
  )
}

function computeWrapViewStyle(wrapStyle) {
  const {context, viewModel, emitItem} = observe(GeoViewContext)
  let zoom = viewModel.style.zoom, z0 = Math.round(50 * zoom), z1 = Math.round(10 * zoom);

  return {
    //maxHeight: wrapStyle.maxHeight * zoom + 'px',
    // backgroundSize: `${z0}px ${z0}px, ${z0}px ${z0}px, ${z1}px ${z1}px, ${z1}px ${z1}px`,
    // backgroundImage: `
    //   linear-gradient(#F0F0F0 1px, transparent 0),
    //   linear-gradient(90deg, #F0F0F0 1px, transparent 0),
    //   linear-gradient(#F7F7F7 1px, transparent 0),
    //   linear-gradient(90deg, #F7F7F7 1px, transparent 0)`,
    //transform: `translate(${viewModel.style.left}px,${viewModel.style.top}px)`,
    backgroundColor: viewModel.style.backgroundColor || 'RGBA(255,255,255,.8)',
    //backgroundImage: viewModel.style.backgroundImage,
  }
}

function computeZoomViewStyle() {
  const {context, viewModel, emitItem} = observe(GeoViewContext)
  const viewStyle = viewModel.style
  let zoom = viewStyle.zoom, z0 = Math.round(50 * zoom), z1 = Math.round(10 * zoom);

  return {
    paddingLeft: viewStyle.paddingLeft || 0,
    paddingTop: viewStyle.paddingTop || 0,
    paddingRight: viewStyle.paddingRight || 0,
    paddingBottom: 200,
    width: viewStyle.width * zoom,
    //width: viewModel.style.width + 'px',
    minHeight: viewStyle.height + 'px',
    transform: `scale(${viewStyle.zoom})`,
    backgroundColor: viewStyle.backgroundColor || 'RGBA(255,255,255,.8)',
  }
}

function init(wrapStyle) {
  const {context, viewModel, emitItem} = observe(GeoViewContext)

  const cfgCanvas = context.configs.stage

  let ly = cfgCanvas?.layout?.toLowerCase();
  if (ly == 'absolute') {
    viewModel.style.setLayout('absolute')
  } else {
    viewModel.style.setLayout('flex-column')
  }
  if (viewModel.style.zoom === null) {
    viewModel.style.zoom = cfgCanvas?.zoom || 1;
  }

  let height: number = viewModel.style.height || cfgCanvas?.style?.height as number,
    width: number = viewModel.style.width || cfgCanvas?.style?.width as number
  switch (cfgCanvas?.type?.toLowerCase()) {
    case 'mobile': {
      height = height || ViewCfgDefault.canvasMobile.height;
      width = width || ViewCfgDefault.canvasMobile.width;
      break;
    }
    case 'pc': {
      height = height || ViewCfgDefault.canvasPC.height;
      width = width || ViewCfgDefault.canvasPC.width;
      break;
    }
    case 'custom': {
      height = height || ViewCfgDefault.canvasCustom.height;
      width = width || ViewCfgDefault.canvasCustom.width;
      break;
    }
  }

  viewModel.style.height = height;
  viewModel.style.width = width;

  wrapStyle.maxHeight = height

  if (cfgCanvas?.style) {
    for (let k in cfgCanvas.style) {
      if (k.match(/^background(Image|Color)$/gi)) {
        viewModel.style[k] = cfgCanvas.style[k]
      }
    }
  }
}

function scroll(evt) {
  const {viewModel} = observe(GeoViewContext)
  const ele = viewModel.$el.parentNode.parentNode as HTMLElement

  viewModel.style.left = ele.scrollLeft
  viewModel.style.top = ele.scrollTop

  //lazyImg(evt.target)
}

function clickWrap() {
  if (dragable.event) {//has something dragging
    return
  }
  const geoViewContext = observe(GeoViewContext)
  const {context, viewModel, emitItem} = geoViewContext

  // if (!viewModel.selectZone) {
  //   viewModel.blur()
  // }
}

function click() {
  if (dragable.event) {//has something dragging
    return
  }
  const geoViewContext = observe(GeoViewContext)
  const {context, viewModel, emitItem} = geoViewContext

  // if (!viewModel.selectZone) {
  //   viewModel.blur()
  // }

  const configs = getConfiguration(geoViewContext)

  emitItem.focus({
    getConfigs() {
      return configs
    },
    getListeners() {
      return []
    }
  })
}