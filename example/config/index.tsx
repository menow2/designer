import {getLocationSearch} from "../utils";

const DUMP_IN_LS: string = '_app_designer_dump_';

const searchParam = getLocationSearch()

export default {
  //mode:'dev',
  comlibAdder(): Promise<any> {//Demo
    return new Promise((resolve, reject): void => {
      import('../../../bricks-logic').then(lib => {
        resolve(lib.default)
      })
    })
  },
  comlibLoader,
  pageLoader,
  //extComDef,//扩展组件定义
  //extBlocks: blocks,
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
    import('../../../bricks-logic').then(lib => {
      const libs = [lib.default]
      // const libs = [libInfo]
      try {
        // const testLib = require('../libs/normal');
        // if (testLib) {
        //   libs.push(testLib.default)
        // }


        const chartLib = require('../../../bricks-pc-normal')
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
    //const searchParam = getLocationSearch()
    // const isDev = [null, undefined].indexOf(getSearchParams('dev'));
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