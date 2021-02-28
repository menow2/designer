/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * MyBricks team @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */

import {FunctionComponent} from "react";
import {uuid} from "./utils";

export namespace NS_Configurable {
  export interface I_Configurable {
    getConfigs(): Category[]
  }

  class Base {
    id: string;

    title?: string;

    description?: string

    constructor(title?: string, description?: string) {
      this.title = title
      this.description = description
    }
  }

  export class Category extends Base {
    constructor(title) {
      super(title)
      this.id = uuid()
    }

    groups: Array<Group> //编辑条目

    addGroup(group: Group) {
      (this.groups || (this.groups = [])).push(group)
    }
  }

//Group
  export class Group extends Base {
    fixedAt: 'top' | 'bottom'

    constructor(title?: string, description?: string) {
      super(title, description)
      this.id = uuid()
    }

    items: Array<Group | EditItem | RenderItem>

    addItem(item: Group | EditItem | RenderItem | FunctionItem) {
      (this.items || (this.items = [])).push(item)
    }

    addItems(items: Array<Group | EditItem | RenderItem>) {
      if (items) {
        items.forEach(item => {
          this.addItem(item)
        })
      }
    }

    fixedAtBottom() {
      return this.fixedAt === 'bottom'
    }
  }

  export class EditItem extends Base {
    type: string //编辑器类型

    selector: string

    options?: { inline: boolean; option: { label; key } } //表单编辑项

    value: { get: Function; set: Function } //取值/赋值 响应式操作

    ifVisible: () => boolean

    ele: HTMLElement

    containerEle:HTMLElement

    constructor(opt: {
      title: string,
      type,
      value,
      selector: string,
      options, ifVisible,
      description: string,
      ele: HTMLElement,
      containerEle:HTMLElement
    }) {
      super(opt.title, opt.description)
      this.type = opt.type;
      this.selector = opt.selector
      this.value = opt.value;
      this.options = opt.options
      if (typeof opt.ifVisible === 'function') {
        this.ifVisible = opt.ifVisible
      }
      this.ele = opt.ele
      this.containerEle = opt.containerEle
    }
  }

  export class FunctionItem extends Base {
    fn

    constructor(fn: Function) {
      super()
      this.fn = fn
    }
  }

//Item
  export class RenderItem extends Base {
    props: { [index: string]: any }
    content: FunctionComponent | string

    constructor(title: string, content: FunctionComponent | string, props?: { [index: string]: any }) {
      super(title)
      this.content = content;
      this.props = props
    }
  }
}