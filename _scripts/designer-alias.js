/**
 * XGraph opensource
 * CheMingjun @2019
 * Mail:chemingjun@126.com Wechat:ALJZJZ
 */

module.exports = Object.assign({//for dev
  '@visualbricks/compiler-js': require('path').resolve(__dirname, '../../../opensource-base/compiler-js/index.ts'),
  '@visualbricks/designer': require('path').resolve(__dirname, '../src/index.ts'),
  '@sdk': require('path').resolve(__dirname, '../src/sdk.ts'),
  '@utils': require('path').resolve(__dirname, '../src/utils/index.ts'),
  // '@types': require('path').resolve(__dirname, '../src/types.ts'),
})