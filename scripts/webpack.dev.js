const path = require('path')
const merge = require("webpack-merge")
const commonCfg = require('./webpack.common')

module.exports = merge(commonCfg, {
  entry: path.resolve(__dirname, '../example/main.js'),
  output: {
    path: path.resolve(__dirname, '../example'),
    filename: './bundle.js',
    libraryTarget: 'umd'
  },
  externals: [{
    'React': 'React',
    'react': 'React',
    'react-dom': 'ReactDOM',
    'rxui': 'rxui',
    '@visualbricks/rxui': 'rxui',
    'antd': 'antd',
    'blockly': 'Blockly',
    'blocks': 'blocks',
    '@ant-design/icons': '@ant-design',
    'axios': 'axios',
    'lodash': {commonjs: "lodash", commonjs2: "lodash", amd: "lodash", root: "_"},
    'moment': 'moment'
  }],
  devtool: 'cheap-source-map',//devtool: 'cheap-source-map',
  resolve: {
    alias: {
      '@visualbricks/designer': require('path').resolve(__dirname, '../src/index.ts'),
      '@sdk': require('path').resolve(__dirname, '../src/sdk.ts'),
      '@utils': require('path').resolve(__dirname, '../src/utils/index.ts'),
    }
  },
  devServer: {
    port: 8000,
    contentBase: path.join(__dirname, '../example'),
    disableHostCheck: true,
    //progress: true,
    inline: true
  },
  //plugins:[devFlagPlugin]
})