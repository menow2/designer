/**
 * XGraph Opensource
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * Mail:chemingjun@126.com Wechat:ALJZJZ
 */

import css from './Mask.less'
import {dragable, evt, observe, useComputed} from 'rxui'
import {getPosition} from '@utils'
import {GeoComModel} from '../com/GeoComModel'
import {GeoViewContext} from './GeoView'
import {DesignerContext} from "@sdk";
import {getEditorPath} from "../com/editorUtils";
import SlotModel from "./SlotModel";

type TMeta = {
  model: GeoComModel,
  points: Array<string>,
  enable: { width: boolean, height: boolean }
}

class Box {
  width: number
  height: number
  left: number
  top: number
}

export default function Mask() {
  const gvContext = observe(GeoViewContext, {
    from: 'parents'
  })

  const {context, viewModel, emitItem} = gvContext

  const zoom = 1

  const focused = useComputed(() => {
    const rtn = []
    if (context.focusModelAry) {
      const focusModelAry = context.focusModelAry.filter(model => model instanceof GeoComModel)
      if (focusModelAry.length > 0) {
        const boxAry = focusBox(context, focusModelAry, zoom)
        if (boxAry) {
          boxAry.forEach((box, idx) => {
            rtn.push(
              <div className={`${css.focus} ${box.editingF ? css.editing : ''}`} key={`focus-mask-${idx}`}
                   style={{
                     width: box.width,
                     height: box.height,
                     left: box.left,
                     top: box.top
                   }}>
                <div className={css.itemTitle} onMouseDown={evt(mouseDown).stop}>
                  {box.title || '无标题'}
                </div>
              </div>
            )
          })
        }
      }
    }
    return rtn
  })

  const hovered = useComputed(() => {
    const rtn = []
    if (gvContext.hoverModel) {
      const box = hoverBox(gvContext.hoverModel, zoom)
      box && rtn.push(
        <div className={css.hover} key='hover-mask'
             style={{
               width: box.width,
               height: box.height,
               left: box.left,
               top: box.top
             }}>
          <div className={css.itemTitle}>
            {box.title || '无标题'}
          </div>
        </div>
      )
    }
    return rtn
  })

  return focused.concat(hovered)
}

function mouseDown(evt) {
  const {context, viewModel, emitItem, emitSnap} = observe(GeoViewContext)

  let model: GeoComModel
  if (context.focusModelAry) {
    const focusModelAry = context.focusModelAry.filter(model => model instanceof GeoComModel)
    if (focusModelAry.length > 0) {
      model = focusModelAry[0] as GeoComModel
    }
  }

  // if (model.state.isEditing()) {
  //   return;
  // }
  //emitItem.focus(void 0)

  let zoom = model.viewStyle.zoom;
  let snap, style, viewPo, toSlot: SlotModel;
  dragable(evt, ({po: {x, y}, epo: {ex, ey}, dpo: {dx, dy}}, state) => {
      if (state == 'start') {
        viewPo = getPosition(model.root.$el)
        style = model.style;

        snap = emitSnap.start('moving geocom')


        emitItem.move(model, 'start')
      }

      if (state == 'moving') {
        model.state.moving()

        if (model.style.isLayoutAbsolute()) {
          style.left += dx / zoom
          style.top += dy / zoom
        }

        emitItem.move(model, 'ing', {x: ex - viewPo.x, y: ey - viewPo.y})

        if (toSlot) {
          toSlot.state.hoverRecover();
        }
        toSlot = model.root.findSlotByPo({x: ex, y: ey}, model)

        if (canCutInSlot(model, toSlot)) {
          toSlot.state.hover();
        } else if (toSlot) {
          toSlot = void 0
        }
      }

      if (state == 'finish') {
        model.state.enable()

        const rtn = emitItem.move(model, 'finish')

        let info = rtn
        if (Array.isArray(rtn)) {
          info = rtn.find(desc => desc && desc.insertOrder !== void 0)
        }

        if (toSlot) {
          const targetId = toSlot.isRoot() ? null : toSlot.parent.id

          emitItem.cutToSlot(model.id, targetId, toSlot.id, info?.insertOrder)
          toSlot.state.hoverRecover()
        } else if (info && info.insertOrder !== void 0) {
          model.parent.insertInto(model, info.insertOrder)
        }

        emitItem.focus(model)

        // setTimeout(v=>{
        //   console.log('----')
        //   model.notifyEleChanged()
        // })


        snap.commit()
      }
    }, {zoom: model.viewStyle.zoom}
  )
}

function canCutInSlot(model: GeoComModel, toSlot: SlotModel) {
  if (toSlot) {
    if (toSlot?.parent === model) {//self's slot
      return false
    }
    if (model.parent === toSlot) {//cur parent slot
      return false
    }
    return true
  }
  return false
}

function focusBox(context: DesignerContext, focusModelAry, zoom) {
  if (focusModelAry.length > 1) {//Multi
    let x, y, w, h;
    focusModelAry.forEach(({style: {left, top, width, height, display}}) => {
      if (x === undefined) {
        x = left;
        y = top;
        w = x + width;
        h = y + height
      } else {
        x = Math.min(left, x);
        y = Math.min(top, y);
        w = Math.max(left + width, w);
        h = Math.max(top + height, h);
      }
    })
    return [{
      editingF: false,
      width: w - x,
      height: h - y,
      left: x,
      top: y
    }]
  } else {
    let fm = focusModelAry[0] as GeoComModel, el;
    //console.log(fm ,fm.$el , fm.$el.children[0], fm.parent.$el ,fm.state.isMoving())

    // if(!fm.parent.$el){////TODO 同步至MPA
    //   debugger
    // }

    //if (fm && fm.$el && (el = fm.$el.children[0]) && !fm.state.isMoving()) {
    if (fm && fm.$el && (el = fm.$el.children[0]) && fm.parent.$el && !fm.state.isMoving()) {
      fm.listenForEleChanged()
      //console.log(222)
      let sty = fm.style,
        epo = getPosition(el),
        ppo = getPosition(fm.parent.$el),
        vpo = getPosition(fm.root.$el)

      let lyAbsF = fm.style.isLayoutAbsolute()
      let lyStatic = fm.style.isLayoutStatic()

      let meta = modelMeta(focusModelAry)
      let points = meta.points.filter(p => lyAbsF || !p.match(/^dot[023467]$/gi))

      const comDef = context.getComDef(fm.runtime.def)

      const editorPath = getEditorPath(void 0, fm, context)
      const titleAry = []
      if (editorPath) {
        editorPath.forEach(({title: tt, ele, model}, idx) => {
          titleAry.push(<span key={idx} onClick={evt(e => {
            model.focus()
            ele.click()
          }).stop}>{tt}</span>)
        })
      }
      titleAry.push(
        <span key='my' onClick={evt().stop}>
        {fm.runtime.title || comDef.title}
      </span>)

      const rtn = [{
        title: titleAry,
        editingF: fm.state.isEditing(),
        // width: (lyAbsF ? sty.width : el.clientWidth) * zoom,
        // height: (lyAbsF || fm.state.isResizing() ?
        //   (sty.height + (el.style.paddingTop ? parseInt(el.style.paddingTop) : 0)
        //     + (el.style.paddingBottom ? parseInt(el.style.paddingBottom) : 0))
        //   : el.clientHeight) * zoom,
        width: el.clientWidth * zoom,
        height: el.clientHeight * zoom,
        //height: sty.height * zoom,
        left: lyAbsF ? ppo.x - vpo.x + sty.left * zoom : epo.x - vpo.x,
        top: lyAbsF ? ppo.y - vpo.y + sty.top * zoom : epo.y - vpo.y,
        //points:lyAbsF?points:null,
        points
      }]

      if (fm.focusArea) {
        fm.focusArea.listenForEleChanged()

        const {title, ele, editorPath} = fm.focusArea

        const titleAry = []
        if (editorPath) {
          editorPath.forEach(({model, title: tt, ele}, idx) => {
            titleAry.push(<span key={idx} onClick={evt(e => {
              model.focus()
              ele.click()
            }).stop}>{tt}</span>)
          })
        }
        titleAry.push(<span key='my' onClick={evt().stop}>{title || '区域'}</span>)

        const epo = getPosition(ele)
        rtn.push({
          title: titleAry,
          width: ele.clientWidth * zoom,
          height: ele.clientHeight * zoom,
          left: epo.x - vpo.x,
          top: epo.y - vpo.y,
        } as any)
      }

      return rtn
    }
  }
}

const metaCache: {
  [index: string]: TMeta
} = {}

function modelMeta(focusModelAry): TMeta {
  if (focusModelAry.length == 1) {
    let model = focusModelAry[0], meta = metaCache[model.id]
    if (meta) {
      return meta
    }
    let points = [], enable = {
      width: false,
      height: false
    }, resize = getEditor(model)

    if (resize) {
      if (typeof (resize) == 'function') {
        points = [
          'dot0', 'dot1', 'dot2',
          'dot3',
          'dot4', 'dot5', 'dot6',
          'dot7'
        ]
        enable.width = true
        enable.height = true
      } else if (typeof (resize) == 'object') {
        let enable;
        if (!resize.options || !(enable = resize.options['enable'])) {
          points = [
            'dot0', 'dot1', 'dot2',
            'dot3',
            'dot4', 'dot5', 'dot6',
            'dot7'
          ]
          enable.width = true
          enable.height = true
        } else if (Array.isArray(enable)) {
          let ts = enable.join('-');
          if (ts.match(/(?=.*width)(?=.*height).*/gi)) {
            points = [
              'dot0', 'dot1', 'dot2',
              'dot3',
              'dot4', 'dot5', 'dot6',
              'dot7'
            ]
            enable.width = true
            enable.height = true
          } else if (ts.match(/(?=.*width).*/gi)) {
            points = [
              'dot3',
              'dot7'
            ]
            enable.width = true
          } else if (ts.match(/(?=.*height).*/gi)) {
            points = [
              'dot1',
              'dot5'
            ]
            enable.height = true
          }
        }
      }
    }
    return metaCache[model.id] = {model, points, enable}
  }
}

function getEditor(model) {
  if (model && model.comDef && model.comDef.edit) {
    let viewOn = model.comDef.edit.on;
    if (!viewOn) {
      return
    }
    viewOn = viewOn.view || viewOn
    let comEdts = viewOn['*'], rs;
    // comEdts && (rs = comEdts.find(
    //   ({type}) => type && (type.toLowerCase() == EditorsAPI.Reserved.resizer.type)))
    return typeof (rs) == 'function' || typeof (rs) == 'object' ? rs : undefined
  }
}

function hoverBox(hoverModel, zoom) {
  let hm: GeoComModel
  if (hm = hoverModel as GeoComModel) {
    if (hm && hm.$el && hm.parent.$el && hm.root.$el && !hm.state.isFocused() && !hm.state.isMoving()
      && !hm.state.isEditing() && !hm.state.isResizing()) {
      hm.listenForEleChanged()

      let el = hm.$el.children[0] as HTMLElement
      if (el) {
        let sty = hm.style,
          epo = getPosition(el),
          ppo = getPosition(hm.parent.$el),
          vpo = getPosition(hm.root.$el)

        let lyAbsF = hm.style.isLayoutAbsolute();
        return {
          title: hm.runtime.title,
          width: el.clientWidth * zoom,
          //height: (lyAbsF ? se.h : el.clientHeight),
          height: el.clientHeight * zoom,
          left: lyAbsF ? ppo.x - vpo.x + sty.left * zoom : epo.x - vpo.x,
          top: lyAbsF ? ppo.y - vpo.y + sty.top * zoom : epo.y - vpo.y
        }
      }
    }
  }
}