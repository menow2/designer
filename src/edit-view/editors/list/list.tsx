import React, { useEffect, useCallback } from 'react';
import { Select } from 'antd'
import { useObservable, dragable } from "rxui"
import { isValid, deepCopy, getCurrentNodeByClassName } from '../utils'
import css from './index.less'

const { Option } = Select

export default function(editConfig): any {
  const { value, options = {} } = editConfig
  const { type = 'text', group = [], isDrag = false, readonly = false } = options
  const model: any = useObservable({val: isValid(value.get()) ? deepCopy(value.get()) : [], value}, [value])

  const update = useCallback(() => {
    !readonly && model.value.set(deepCopy(model.val))
  }, [])

  const add = useCallback(() => {
    let res = ''
    let isUpdate = false
    if (type === 'select') {
      res = group[0].value
      isUpdate = true
    }
    model.val.push(res)
    isUpdate && update()
  }, [])

  const del = useCallback((idx) => {
    model.val.splice(idx, 1)
    update()
  }, [])

  const mouseDown = useCallback((currentNode: any, e: any, idx: number) => {
    const moveNode = document.createElement('div')
    const copyNode = currentNode.cloneNode(true)
    const po = currentNode.getBoundingClientRect()
    const startY = po.top

    moveNode.style.position = 'absolute'
    moveNode.style.left = `${po.left}px`
    moveNode.style.top = `${po.top}px`
    moveNode.style.opacity = '0.5'
    moveNode.style.zIndex = '1000'
    moveNode.style.width = `${po.width}px`
    
    dragable(e, ({po: {x, y}, dpo: {dx, dy}}: any, state: string) => {
      if (state === 'start') {
        moveNode.appendChild(copyNode)
        document.body.appendChild(moveNode)
        currentNode.style.opacity = '0.5'
      }
      if (state === 'moving') {
        moveNode.style.top = `${y + dy}px`
        moveNode.style.left = `${x + dx}px`
      }
      if (state === 'finish') {
        const interval = startY - y
        let count = 0

        if (interval < 0) {
          count = Math.floor(-interval / 37)
          
          if (count) {
            const variable = model.val.splice(idx, 1)[0]
            model.val.splice(count+idx, 0, variable)
          }
        } else if (interval > 0) {
          const variable = model.val.splice(idx, 1)[0]

          count = Math.floor(interval / 37)

          if (idx - count > 0) {
            model.val.splice(idx - count, 0, variable)
          } else {
            model.val.unshift(variable)
          }
        }

        currentNode.style.opacity = '1'
        document.body.removeChild(moveNode)
        
        update()
      }
    })
  }, [])

  useEffect(() => {
    return () => {
      const newList = model.val
      const oldList = value.get()

      if (!Array.isArray(newList) || !Array.isArray(oldList)) {
        update()
      } else {
        let isOld = false

        if (newList.length !== oldList.length) {
          isOld = true
        } else {
          for(let i in newList) {
            if (newList[i] !== oldList[i]) {
              isOld = true
              break
            }
          }
        }

        if (isOld) {
          update()
        }
      }
    }
  }, [])

  return (
    <div className={css['editor-list']}>
      {
        model.val.map((item: string, idx: number) => {
          return (
            <div key={`item_${idx}`} className={css['editor-list__item']}>
              {isDrag && !readonly && <div className={css['editor-list__move']} onMouseDown={e => {
                const currentNode = getCurrentNodeByClassName(e, 'editor-list__item')
                if (currentNode) {
                  mouseDown(currentNode, e, idx)
                }
              }}>
                <UnorderedListOutlined />
              </div>}
              {type === 'text' ? 
                <input
                  type='text'
                  placeholder="键名"
                  disabled={readonly}
                  className={css['editor-list__item-v']}
                  value={item}
                  onChange={evt => {
                    model.val[idx] = evt.target.value
                  }} 
                  onKeyPress={evt => {
                    if (evt.key !== 'Enter') return
                    // if (evt.which !== 13) return
                    update()
                  }}
                  onBlur={update}/> : 
                <Select
                  disabled={readonly}
                  style={{width: '100%'}}
                  dropdownClassName={css['editor-list__item-dropdown']}
                  value={item}
                  onChange={evt => {
                    model.val[idx] = evt
                    update()
                  }}
                >
                  {group.map(({label, value}: any, idx: number) => {
                    return (
                      <Option key={`${value}${idx}`} value={value}>{label}</Option>
                    )
                  })}
                </Select>}
              {!readonly && <div className={css['editor-list__item-del']} onClick={() => del(idx)}>x</div>}
            </div>
          )
        })
      }
      {!readonly && <button className={css['editor-list__add']} onClick={add}>新增</button>}
    </div>
  )
}

function UnorderedListOutlined() {
  return (
    <span role="img" aria-label="unordered-list" className="anticon anticon-unordered-list">
      <svg className="editor-list__svg-move" viewBox="64 64 896 896" focusable="false" data-icon="unordered-list" width="1em" height="1em" fill="currentColor" aria-hidden="true">
        <path className="editor-list__svg-move" d="M912 192H328c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h584c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 284H328c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h584c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 284H328c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h584c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM104 228a56 56 0 10112 0 56 56 0 10-112 0zm0 284a56 56 0 10112 0 56 56 0 10-112 0zm0 284a56 56 0 10112 0 56 56 0 10-112 0z"/>
      </svg>
    </span>
  )
}