/**
 * MyBricks Opensource
 * This source code is licensed under the MIT license.
 *
 * MyBricks team @2019
 * Mail:mybricks@126.com Wechat:ALJZJZ
 */

export function each<ItemType>(fn: (item: ItemType) => any, ...args) {
  args.forEach(ary => {
    ary && ary.forEach(fn)
  })
}

export function find(fn, ...args) {
  let rtn;
  args.find(ary => {
    if (ary) {
      return rtn = ary.find(sth => fn(sth))
    }
  })
  return rtn;
}

export function merge(...arys){
  let rtn = []
  arys.forEach(ary=>{
    rtn = rtn.concat(ary)
  })
  return rtn
}

export function length(...args):number {
  let rtn = 0;
  args.forEach(ary => {
    if (Array.isArray(ary)) {
      rtn+=ary.length
    }
  })
  return rtn;
}