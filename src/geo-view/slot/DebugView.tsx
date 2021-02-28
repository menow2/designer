/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * MyBricks team @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */

import css from './DebugView.less';

import {observe, useComputed, useObservable} from 'rxui';
import React, {useEffect} from 'react';
import {ViewCfgDefault} from '../config';

import GeoCom from '../com/GeoCom';
import {GeoViewContext, scrollFix} from './GeoView';
import {GeoComModel} from "../com/GeoComModel";

export default function DebugView() {
  const wrapStyle = useObservable({maxHeight: 0})

  const {context, viewModel, emitItem} = observe(GeoViewContext, {
    from: 'parents'
  })

  useComputed(() => componentWillMounted(wrapStyle))

  // useEffect(() => {
  //   return () => {
  //     if (context.isDesnMode()) {
  //       viewModel.comAry.forEach(item => {
  //         item.clearDebug()
  //       })
  //     }
  //   }
  // }, [])


  useEffect(() => {
    if (viewModel.state.isEnabled()) {
      scrollFix(viewModel)
    }
  }, [viewModel.state.isEnabled()])

  const zoomViewStyle = useComputed(computeZoomViewStyle)

  const content = useComputed(() => {
    return viewModel.comAry.map((md: GeoComModel, idx) => {
        const debug = md.getDebug()
        return debug ? <GeoCom key={md.id} model={debug}/> : null
      }
    )
  })

  return (
    <div className={css.viewWrap}
         style={{display: viewModel.state.isEnabled() ? 'block' : 'none'}}>
      <div className={css.geoView}>
        <div style={zoomViewStyle}
             className={`${css.zoomView}`}
             ref={ele => ele && (viewModel.$el = ele)}>
          {content}
        </div>
      </div>
    </div>
  )
}

function computeZoomViewStyle() {
  const {context, viewModel, emitItem} = observe(GeoViewContext)
  const viewStyle = viewModel.style
  return {
    width: viewStyle.width + 'px',
    //transform: `scale(${viewStyle.zoom})`,
    backgroundColor: viewStyle.backgroundColor,
    backgroundImage: viewStyle.backgroundImage,
    paddingLeft: viewStyle.paddingLeft || 0,
    paddingTop: viewStyle.paddingTop || 0,
    paddingRight: viewStyle.paddingRight || 0,
  }
}

function componentWillMounted(wrapStyle) {
  const {context, viewModel, emitItem} = observe(GeoViewContext)

  const ctCfgs = context.configs, stageCfg = ctCfgs.stage

  let ly = stageCfg?.layout?.toLowerCase();
  if (ly == 'absolute') {
    viewModel.style.setLayout('absolute')
  } else {
    viewModel.style.setLayout('flex-row')
  }
  if (viewModel.style.zoom === null) {
    viewModel.style.zoom = ctCfgs.stage.zoom || 1;
  }

  let height = viewModel.style.height || stageCfg?.style?.height,
    width = viewModel.style.width || stageCfg?.style?.width;
  switch (stageCfg.type.toLowerCase()) {
    case 'mobile': {
      height = height || ViewCfgDefault.canvasMobile.height;
      width = width || ViewCfgDefault.canvasMobile.width;
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

  if (stageCfg.style) {
    for (let k in stageCfg.style) {
      if (k.match(/^background(Image|Color)$/gi)) {
        viewModel.style[k] = stageCfg.style[k]
      }
    }
  }
}
