function getStr(obj) {
  return Object.prototype.toString.call(obj)
}

/**
 * 判断是否为数组
 * @author yxk
 * @param obj
 * @returns {boolean}
 */
export function isArray(obj) {
  return getStr(obj) === '[object Array]'
}

/**
 * 判断是否为 object
 * @author yxk
 * @param obj
 * @returns {boolean}
 */
export function isObject(obj) {
  return getStr(obj) === '[object Object]'
}

/**
 * 判断是否为空
 * @author yxk
 * @description 空数组 空对象 去掉首尾空格的空字符串 都为记为空
 * @param obj
 * @returns {boolean}
 */
export function isEmpty(obj) {
  if (isArray(obj)) return obj.length === 0
  if (isObject(obj)) return Object.keys(obj).length === 0
  if (typeof obj === 'string') return obj.trim().length === 0
  return obj === null || obj === undefined
}

/**
 * 对象深拷贝
 * @author yxk
 * @param target 被拷贝的对象
 * @returns {Object} 拷贝结果
 */
export function deepCopy(target = null) {
  let res
  if (typeof target === 'object') {
    if (isArray(target)) {
      res = []
      target.forEach(item => {
        res.push(deepCopy(item))
      })
    } else if (isObject(target)) {
      res = {}
      const keys = Object.keys(target)
      keys.forEach(key => {
        res[key] = deepCopy(target[key])
      })
    } else {
      res = target
    }
  } else {
    res = target
  }
  return res
}
