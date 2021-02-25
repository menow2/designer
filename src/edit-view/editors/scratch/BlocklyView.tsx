/**
 * XGraph Opensource
 * This source code is licensed under the MIT license.
 * 
 * CheMingjun @2019
 * Mail:chemingjun@126.com Wechat:ALJZJZ
 */

import css from './BlocklyView.less';

import {dragable, evt, undo, redo, observe, useComputed, useObservable} from "rxui";
import {initConfig} from "./init";
import {useCallback, useEffect, useMemo} from "react";

import Console from './Console';

import {DesignerContext, NS_Emits} from "@sdk";
import {BLOCK_TYPE_INPUT_START} from "./constants";

import BlocklyContext from './BlocklyContext';
import {antiShaking, getPosition} from "@utils";
import {message} from 'antd';

export default function BlocklyView({options, value, closeView}:
                                      { options: { blocks, startBlocks }, value: { get, set }, closeView }) {
  const emitItem = useObservable(NS_Emits.Component, {expectTo: 'parents'})
  const desnCtx = observe(DesignerContext, {from: 'parents'})
  const ctx = useObservable(BlocklyContext, next => {
    const fns = value.get()
    let curFn
    if (Array.isArray(fns)) {
      if (fns.length > 0) {
        curFn = fns[0]
      }
    }

    const extBlocks = options.blocks
    const startBlocks = options.startBlocks
    next({
      _designerContext: desnCtx,
      startBlocks,
      blocksDef: extBlocks,
      value,
      fns,
      curFn,
      closeView
    })
  }, {ignore: ['workspace'], to: "children"})

  const resize = useCallback(() => {
    Blockly.svgResize(ctx.workspace);
  }, [])

  useEffect(() => {
    const wsCfg = initConfig(ctx)
    ctx.workspace = Blockly.inject('_workspace_', wsCfg)
    
    setTimeout(() => {
      resize()
      ctx.workspace.addChangeListener(wsEvent);
    })

    const AS = antiShaking()

    function wsEvent(primaryEvent) {
      if (primaryEvent instanceof Blockly.Events.Ui) {
        if (primaryEvent.blockId) {
          const block = ctx.workspace.getBlockById(primaryEvent.blockId)

          emitItem.focus({
            getConfigs() {
              return block && block._getConfig ? block._getConfig() : void 0
            }
          })
        }
      } else {
        if (primaryEvent.type === 'var_create') {
          ctx.addVar(primaryEvent.varName)
        } else if (primaryEvent.type === 'create') {

        }

        const topBlocks = ctx.workspace.getTopBlocks()
        const topIds = {}
        if (topBlocks) {
          topBlocks.forEach(block => {
            topIds[block.id] = true
            if (!block._rootBlock) {
              block.setEnabled(false)
            }
          })
        }
        ctx.workspace.getAllBlocks().forEach(block => {
          if (!topIds[block.id]) {
            if (!block.isEnabled()) {
              block.setEnabled(true)
            }
          }
        })

        AS.push(() => {
          save(ctx)
        })
      }
    }

    //Check if editor size changed
    document.querySelector('#_iframe_').contentWindow.addEventListener('resize', () => {
      console.log('size Change！');
      resize()
    }, false)

    //Blockly.Variables.createVariableButtonHandler(workspace, null, 'panda');
    switchFn(ctx, ctx.curFn)
  }, [])

  const fnMenu = useMemo(() => {
    const rtn = []
    ctx.getFns().forEach((fn, idx) => {
      const title = fn.title + `${fn.input ? '(' + fn.input + ')' : ''}`
      rtn.push(<div key={'input-' + idx} className={css.item}
                    onClick={e => {
                      if (ctx.curFn.id !== fn.id) {
                        switchFn(ctx, fn)
                      }
                    }}>{title}</div>)
    })
    return rtn
  }, [])

  const menuStyle = useComputed(() => {
    if (ctx.showMenu) {
      const po = getPosition(ctx.inputEle)
      return {
        display: 'block',
        left: po.x,
        top: po.y
      }
    } else {
      return {
        display: 'none'
      }
    }
  })

  const vars = useComputed(() => {
    const varAry = ctx.getCurVars()
    if (varAry) {
      const rtn = []
      varAry.forEach((varModel, idx) => {
        rtn.push(<div className={css.var} key={'-' + idx}
                      onMouseDown={e => moveVar(e, varModel.name)}>{varModel.name}</div>)
      })
      return rtn
    }
  })

  /**
   * @description Blockly块的跨scratch组件,跨标签页黏贴
   * @author 林紫微
   * @time 2021/02/20
   */
  //复制：记录复制的workspaceId
  useMemo(()=>{
    document.addEventListener('copy', function(e){
      if(!Blockly.clipboardTypeCounts_){
        localStorage.setItem('blockText', "")
      }else{
        if(Blockly.clipboardXml_){
          const blockText = Blockly.Xml.domToText(Blockly.clipboardXml_)
          localStorage.setItem('blockText', "")
          localStorage.setItem('blockText', blockText)
          Blockly.clipboardXml_ = null
          Blockly.clipboardSource_ = null
          Blockly.clipboardTypeCounts_ = null
        }
      }
    })
  },[])
  //黏贴
  useMemo(()=>{
    document.addEventListener('paste',function(e){
      e.stopPropagation()
      const blockText = localStorage.getItem('blockText')
      if(blockText!==""){
        const block = Blockly.Xml.textToDom(blockText)
        const clipdata = block
        if(clipdata){
          ctx.workspace.paste(clipdata)
        }
      }
    })
  },[])

  return (
    <div className={css.workspace} onClick={e => ctx.showMenu = false}>
      <div className={css.titleBar}>
        <div className={css.navBar}>
          <p className={css.tt} onClick={close}>返回</p>
          <span className={css.sper}/>
          <p ref={ele => ele && (ctx.inputEle = ele)} className={css.tt}
             onClick={evt(e => ctx.showMenu = true).stop}>
            {ctx.curFn.title}
          </p>
          <div className={css.menu} style={menuStyle}>{fnMenu}</div>
          <span className={css.sper}/>
        </div>
        <div className={css.vars}>
          {/*<div className={css.tt}>变量</div>*/}
          <div className={css.varsList}>
            {vars}
          </div>
          <div className={`${css.var} ${css.varAdd}`} onClick={e => createVar()}>创建变量</div>
          <div className={`${css.var} ${css.varAdd}`} onClick={e => setVar()}>变量赋值</div>
          {/* <div className={`${css.var} ${css.exImport}`} onClick={e => exportAll()}>导出</div>
          <div className={`${css.var} ${css.exImport}`} onClick={e => imports()}>导入</div> */}
        </div>
      </div>
      <div id='_workspace_' className={css.main}/>
      <Console onResize={resize}/>
      <iframe id='_iframe_' style={{width: '100%', height: '100%', position: 'absolute', left: 0, top: 0, zIndex: -1}}/>
    </div>
  )
}

function close() {
  const ctx = observe(BlocklyContext)
  const {value, closeView, getFns} = ctx

  save(ctx)

  ctx.workspace.dispose()

  value.set(getFns())

  closeView()
}

function setVar() {
  const {workspace} = observe(BlocklyContext)
  const containerBlock = workspace.newBlock('xg.var_set');

  containerBlock.initSvg();
  containerBlock.render()
  containerBlock.moveBy(20, 20);
}

function moveVar(evt, varName) {
  const {createBlock} = observe(BlocklyContext)

  let varBlock
  dragable(evt, ({po: {x, y}, epo: {ex, ey}, dpo: {dx, dy}}, state) => {
    if (state === 'moving') {
      if (!varBlock) {
        varBlock = createBlock('variables_get', {name: varName})
        const tpo = getPosition(document.querySelector('.blocklyBlockCanvas'))
        const tx = (x - tpo.x) / 0.70
        const ty = (y - tpo.y) / 0.70
        varBlock.moveBy(tx, ty)

        // Blockly.Events.fire(new Blockly.Events.Ui(varBlock));
        //
        // //Blockly.Events.fire(new Blockly.Events.BlockChange(th, 'params', 'params', true, false))
        //
      }
      if (varBlock) {
        varBlock.moveBy(dx / 0.7, dy / 0.7)
      }
    }
  })
}

function createVar() {
  const {addVar, model, workspace, createBlock} = observe(BlocklyContext)
  const varName = window.prompt("创建新的变量", "")
  if (!varName) {
    return
  }
  addVar(varName)
}

/**
 * @description 整个workspace导出和导入
 * @author 林紫微
 * @time 2021/02/18
 */
// function exportAll(){
//   const {workspace} = observe(BlocklyContext)
//   try{
//     const xml = Blockly.Xml.workspaceToDom(workspace)
//     const exportText = Blockly.Xml.domToText(xml)
//     localStorage.setItem("exportBlocks", exportText)
//     message.info("已导出")
//   }catch(err){
//     console.log('导出错误: ', err)
//   }
  
// }
// function imports(){
//   const {workspace} = observe(BlocklyContext)
//   const exportText = localStorage.getItem("exportBlocks")
//   if(!exportText){
//     console.log("导入：空")
//   }else{
//     try{
//       const xml = Blockly.Xml.textToDom(exportText)
//       Blockly.Xml.domToWorkspace(xml,workspace)
//       message.info("导入完成")
//       localStorage.setItem("exportBlocks","")
//     }catch(err){
//       console.log('导入错误: ', err)
//     }
//   }
// }

function switchFn(ctx: BlocklyContext, toFn) {
  const {curFn, workspace, getCurXml, setCurXml, setCurScript} = ctx

  function domToWS() {
    let curXml = getCurXml()

    if (curXml) {
      const dom: Element = Blockly.Xml.textToDom(curXml)
      Blockly.Xml.domToWorkspace(dom, workspace)
    }
  }

  if (curFn.id === toFn.id) {
    domToWS()
  } else {
    saveCurWS(ctx)

    Blockly.mainWorkspace.clear();

    ctx.setCurFn(toFn)

    const oriTree = workspace.options.languageTree
    workspace.updateToolbox(oriTree);

    domToWS()
  }

  const varAry = ctx.getCurVars()
  if (!varAry) {
    if (ctx.curFn.input) {
      workspace.createVariable(ctx.curFn.input)
    }

    const varAry = []
    const varModelList = ctx.workspace.getAllVariables()
    varModelList.forEach(({id, name, type}) => {
      varAry.push({id, name, type})
    })
    ctx.setCurVars(varAry)
  } else {
    varAry.forEach(varModel => {
      if (!workspace.getVariable(varModel.name)) {
        workspace.createVariable(varModel.name)
      }
    })
  }

  const topBlocks = workspace.getTopBlocks()
  if (topBlocks) {
    const startId = ctx.startBlocks && ctx.startBlocks[curFn.id] || BLOCK_TYPE_INPUT_START

    // topBlocks.forEach(block=>{
    //   block.setDeletable(true)
    // })

    if (!topBlocks.find(block => {
      return block.type === startId
    })) {
      const containerBlock = workspace.newBlock(startId);

      containerBlock.initSvg();
      containerBlock.render()
      containerBlock.moveBy(100, 100);
      containerBlock.setDeletable(false)
    }
  }
}

function save(ctx: BlocklyContext) {
  const {getFns, value} = ctx
  ctx.mode = 'runtime'
  saveCurWS(ctx)
  value.set(getFns())
}

function saveCurWS(ctx: BlocklyContext) {
  const {setCurXml, setCurScript, workspace} = ctx
  const xml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace, false))
  setCurXml(xml)//Save it

  let script = Blockly['JavaScript'].workspaceToCode(workspace)
  setCurScript(script)
}

