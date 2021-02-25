import {getLocationSearch} from "./utils";
import {DUMP_IN_LS} from "./constants";

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

    if (searchParam.length) {
      let pageData: any = localStorage.getItem(`${DUMP_IN_LS}${searchParam}`);

      if (!pageData) {
        const data = localStorage.getItem(DUMP_IN_LS)
        if (searchParam === 'dev' && data) {
          pageData = data
          localStorage.setItem(`${DUMP_IN_LS}dev`, JSON.stringify(data));
        } else {
          resolve(void 0);
        }
      }

      pageData = JSON.parse(pageData);

      const {pageAry} = pageData;

      if (pageId === void 0) {
        resolve(pageAry)
      } else {
        const page = pageAry.find(page => page.id === pageId);
        resolve(page ? page : void 0)
      }
    } else {
      if (pageId === void 0) {
        resolve()
      } else {
        resolve()
      }
    }
  })
}