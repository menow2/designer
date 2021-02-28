import {getLocationSearch} from "./utils";
import {LS_DEFAULT_KEY, LS_VB_PRE} from "./constants";

export default {
  comlibAdder(): Promise<any> {//Demo
    return new Promise((resolve, reject): void => {
      import('../../bricks-logic').then(lib => {
        resolve(lib.default)
      })
    })
  },
  comlibLoader,
  pageLoader,
  stage: {//舞台
    type: 'pc',//mobile|pc
    configs: {//聚焦空白区域的configs
      title: '项目',
      items: [
        {
          title: '项目名称',
          type: 'Text',
          field: 'title',
          value: (function () {
            let val = '项目名称'
            return {
              get: () => {
                return val
              },
              set: (v: any) => {
                val = v
              }
            }
          })()
        }]
    },
  }
}

function comlibLoader(): Promise<any> {
  return new Promise((resolve, reject): void => {
    import('../../bricks-logic').then(lib => {
      const libs = [lib.default]
      try {
        const chartLib = require('../../bricks-pc-normal')
        if (chartLib) {
          libs.push(chartLib.default)
        }
      } catch (e) {

      }
      resolve(libs)
    })
  })
}

function pageLoader(pageId: string) {
  return new Promise((resolve, reject): void => {
    const searchParam = getLocationSearch()

    let pageData: any = localStorage
      .getItem(`${LS_VB_PRE}${searchParam.length ? searchParam : LS_DEFAULT_KEY}`);

    function fn(pageData) {
      const {pageAry} = pageData;

      if (pageId === void 0) {
        resolve(pageAry)
      } else {
        const page = pageAry.find(page => page.id === pageId);
        resolve(page ? page : void 0)
      }
    }

    if (!pageData) {
      if (!searchParam || !searchParam.length) {
        import('./data/example.json').then(json => {
          fn(json.default)
        })
      } else {
        resolve()
      }
    } else {
      fn(JSON.parse(pageData))
    }
  })
}