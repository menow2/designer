import { last } from 'lodash'

const HCODE_STATIC_HOST = 'https://power-static.51downapp.cn/hcode'

/**
 * 根据组件namespace生成图片路径
 * @param namespace 
 * @param iconPath 图标路径
 */
export function formatIconPath(namespace: string, iconPath: string) {
  const comName = last(namespace.split('.'))
  const ext = last(iconPath.split('.'))
  return `${HCODE_STATIC_HOST}/coms/${namespace}/images/${comName}.icon.${ext}`
}