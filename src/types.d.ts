
/**
 * 任意 key-value Object对象
 */
export interface ExtendObject {
  [key: string]: any
}

/**
 * 跳转参数
 * @property {string} url 跳转 url
 * @property {ExtendObject} query 跳转参数
 */
export interface RouteParams extends ExtendObject {
  url: string,
  query?: ExtendObject
}
