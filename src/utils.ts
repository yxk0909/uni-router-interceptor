/**
 * @file 常用类型判断工具
 * @author yxk
 */

const getType = (data: any): string => {
  return Object.prototype.toString.call(data)
}

/**
 * 判断是否为数组
 * @param {any} data
 * @returns {boolean}
 */
export function isArray(data: any): boolean {
  return getType(data) === '[object Array]'
}

/**
 * 判断是否为 object
 * @param {any} data
 * @returns {boolean}
 */
export function isObject(data: any): boolean {
  return getType(data) === '[object Object]'
}

/**
 * 判断是否为函数
 * @param {any} func 参数
 * @returns {boolean}
 */
export function isFunc(func: any) {
  if (!func) return false
  return typeof func === 'function'
}

/**
 * 判断是否为空
 * @description 空数组 空对象 去掉首尾空格的空字符串 都为记为空
 * @param {any} data
 * @returns {boolean}
 */
export function isEmpty(data: any): boolean {
  if (isArray(data)) return data.length === 0
  if (isObject(data)) return Object.keys(data).length === 0
  if (typeof data === 'string') return data.trim().length === 0
  return data === null || data === undefined
}

/**
 * 对象深拷贝
 * @param {any} target 被拷贝的对象
 * @returns {any} 拷贝结果
 */
export function deepCopy<T>(target: T): T {
  if (!isArray(target) && !isObject(target)) return target

  let result: any
  if (isObject(target)) result = {}
  if (isArray(target)) result = []

  for (const key in target) {
    result[key] = deepCopy(target[key])
  }

  return result as T
}
