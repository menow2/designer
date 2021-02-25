const path = require('path')
const merge = require("webpack-merge")
const commonCfg = require('./webpack.common')

const designerAlias = require('./designer-alias')

//process.env.NODE_ENV = 'dev'

const webpack = require('webpack')

// const devFlagPlugin = new webpack.DefinePlugin({
//   _RUN_XG_: true
// });

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
    //'rxui': 'rxui',
    'antd': 'antd',
    'blockly': 'Blockly',
    'blocks': 'blocks',
    'BizCharts': 'BizCharts',
    'bizcharts': 'BizCharts',
    '@ant-design/icons': '@ant-design',
    //'pceditors': 'pceditors',
    'axios': 'axios',
    // 'Mock': 'mockjs',
    'mockjs': 'Mock',
    // 'mockjs': 'mockjs',
    '@antv/data-set': 'DataSet',
    '@turf/turf': 'turf',
    'lodash': {commonjs: "lodash", commonjs2: "lodash", amd: "lodash", root: "_"},
    'moment': 'moment'
  }],
  devtool: 'cheap-source-map',//devtool: 'cheap-source-map',
  resolve: {
    alias: Object.assign(designerAlias, {//for dev
      'react': require('path').resolve(__dirname, '../node_modules/react'),
      'react-dom': require('path').resolve(__dirname, '../node_modules/react-dom'),
      'pceditors': require('path').resolve(__dirname, '../node_modules/@hb/pc-editors'),
      'rxui': require('path').resolve(__dirname, '../../../opensource-base/rxui/src/'),
      '@visualbricks/rxui': require('path').resolve(__dirname, '../../../opensource-base/rxui/src/'),
    }),
    // alias: {//for dev
    //   '@hb/app-designer': require('path').resolve(__dirname, '../src'),
    //   'react': require('path').resolve(__dirname, '../node_modules/react'),
    //   'react-dom': require('path').resolve(__dirname, '../node_modules/react-dom'),
    //   'rxui': require('path').resolve(__dirname, '../../rxui/src/'),
    //   'xgraph.compiler': require('path').resolve(__dirname, '../node_modules/@hb/xgraph.compiler'),
    //   'xgraph.desn-sdk': require('path').resolve(__dirname, '../node_modules/@hb/xgraph.desn-sdk'),
    //   'xgraph.desn-dblview': require('path').resolve(__dirname, '../node_modules/@hb/xgraph.desn-dblview')
    // }
  },
  devServer: {
    port: 8000,  //端口设置
    contentBase: path.join(__dirname, '../example'),
    disableHostCheck: true,
    //progress: true,
    inline: true
  },
  //plugins:[devFlagPlugin]
})