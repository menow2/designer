import {message} from "antd";

const typeMap = {
  'OBJECT': '[object Object]',
  'ARRAY': '[object Array]',
  'STRING': '[object String]',
  'NUMBER': '[object Number]',
  'FORMDATA': '[object FormData]'
}

export function getLocationSearch() {
  return location.search.replace(/\?/, '')
}

export function copyText(txt: string): boolean {
  const input = document.createElement('input')
  document.body.appendChild(input)
  input.value = txt
  input.select()
  document.execCommand('copy')
  document.body.removeChild(input)
  return true
}

export function isJSON(str: string): boolean {
  try {
    if (typeof JSON.parse(str) == 'object') {
      return true
    }
  } catch (error) {
    return false
  }

  return false
}

export function typeCheck(variable: any, type: string): boolean {
  const checkType = /^\[.*\]$/.test(type) ? type : typeMap[type.toUpperCase()]

  return Object.prototype.toString.call(variable) === checkType
}


export function deepCopy(obj: any, cache: any = []) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  const hit: any = cache.filter((c: any) => c.original === obj)[0]
  if (hit) {
    return hit.copy
  }
  const copy: any = Array.isArray(obj) ?  [] :   {}

  cache.push({
    original: obj,
    copy
  })
  
  Object.keys(obj).forEach(key => {
    copy[key] = deepCopy(obj[key], cache)
  })

  return copy
}