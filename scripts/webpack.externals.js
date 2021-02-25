module.exports = {
  externals: [{
    'React': 'React',
    'react': 'React',
    // 'react-dom': 'ReactDOM',
    'react-dom': {
      'commonjs': 'react-dom',
      'commonjs2': 'react-dom',
      'amd': 'react-dom',
      'root': 'ReactDOM'
    },
    'rxui': 'rxui',
    'pceditors': 'pceditors',
    'antd': 'antd',
    'axios': 'axios',
    '@ant-design/icons': '@ant-design',
    'BizCharts': 'BizCharts',
    'bizcharts': 'BizCharts',
    // 'Mock': 'mockjs',
    'mockjs': 'Mock',
    // 'mockjs': 'mockjs',
    '@antv/data-set': 'DataSet',
    '@turf/turf': 'turf',
    'lodash': {commonjs: "lodash", commonjs2: "lodash", amd: "lodash", root: "_"},
    'moment': 'moment',
    'vue': 'Vue',
    'element-ui': 'ElementUI'
  }]
}
