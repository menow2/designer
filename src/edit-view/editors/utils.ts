export function isValid(val: any) {
  return val !== null && val !== undefined
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

export function getCurrentNodeByClassName(e: any, cn: string): any {
  const className = e.className || e.target.className
  const resMatch = (className.baseVal || className).match(new RegExp(cn))

  if (resMatch && resMatch.input.includes(cn)) {
    return e.target || e
  } else {
    return getCurrentNodeByClassName(e.parentNode || e.target.parentNode, cn)
  }
}