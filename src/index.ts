/**
 * @file uni-router-interceptor
 * @author yxk
 * @version 2.0.0.beta
 *  https://github.com/yxk0909/uni-router-interceptor.git
 */
import { ExtendObject, RouteParams, RouteOptions } from '../types'
import {
  deepCopy,
  isArray,
  isObject,
  isFunc
} from './utils'

const VERSION: string = '2.0.0.beta'

const INTERCEPTOR_API: string[] = [
  'navigateTo',
  'redirectTo',
  'reLaunch',
  'switchTab',
  'navigateBack',
  'preloadPage'
]

/**
 * 处理路由跳转的参数
 * @param {RouteParams|string} params
 * @return {Object}
 */
const getRealParams = function(params: RouteParams | string): Object {
  if (typeof params === 'string') return { url: params }

  if (!isObject(params)) throw new Error('The parameter of the route jump must be an object or a string')

  const data = deepCopy(params)
  const query: ExtendObject = data.query || {}
  delete data.query

  // 拼接处理路由的Query参数
  const arr: string[] = []
  Object.keys(query).forEach(key => {
    let val = query[key]
    if (val === undefined || val === null) val = ''
    if (isObject(val) || isArray(val)) {
      val = encodeURIComponent(JSON.stringify(val))
    }
    arr.push(`${key}=${val}`)
  })

  const search: string = '?' + arr.join('&')
  return {
    ...data,
    url: data.url + search
  }
}

class Router {
  version: string

  /**
   * 主页路由
   */
  homePage: string

  /**
   * 当前页面栈的实例数组
   */
  pages: any[]

  /**
   * 历史记录
   */
  history: any[]

  /**
   * 路由跳转前回调
   */
  beforeEachCallback: Function | undefined

  /**
   * 路由跳转后回调
   */
  afterEachCallback: Function | undefined

  /**
   * 路由跳转失败回调
   */
  errorCallback: Function | undefined

  [key: string]: any

  constructor(options: RouteOptions) {
    this.version = VERSION
    this.homePage = options.homePage || '/'

    this.pages = []
    this.history = []
    this.beforeEachCallback = undefined
    this.afterEachCallback = undefined
    this.errorCallback = undefined

    INTERCEPTOR_API.forEach(key => {
      this[key] = (params: string | Object) => this._execMethod(key, params)
    })
  }

  public install(Vue: any) {
    const version = Number(Vue.version.split('.')[0])
    if (version < 3) {
      // Vue 2.x
      Vue.prototype.$Router = this
    } else {
      // Vue 3.x
      Vue.config.globalProperties.$Router = this
    }
  }

  public beforeEach(callback: Function | unknown) {
    if (!callback) {
      this.beforeEachCallback = undefined
      return
    }
    if (!isFunc(callback)) throw new Error('beforeEach callback must be a function !!')
    this.beforeEachCallback = <Function> callback
  }

  public afterEach(callback: Function | unknown) {
    if (!callback) {
      this.afterEachCallback = undefined
      return
    }
    if (!isFunc(callback)) throw new Error('afterEach callback must be a function !!')
    this.afterEachCallback = <Function> callback
  }

  public error(callback: Function | unknown) {
    if (!callback) {
      this.errorCallback = undefined
      return
    }
    if (!isFunc(callback)) throw new Error('error callback must be a function !!')
    this.errorCallback = <Function> callback
  }

  public removeInterceptor(methodName: string | undefined) {
    if (!methodName) {
      INTERCEPTOR_API.forEach(key => {
        // @ts-ignore
        uni.removeInterceptor(methodName)
      })
    }

    if (!INTERCEPTOR_API.includes(<string> methodName)) return

    // @ts-ignore
    uni.removeInterceptor(methodName)
  }

  private _execMethod(key: string, params: string | Object) {}

  private _addInterceptor() {
    const _this = this
    let to: Object, from: Object, next: Function

    INTERCEPTOR_API.forEach(key => {
      // @ts-ignore
      uni.addInterceptor(
        key,
        {
          async invoke(args: string | Object) {},
          success() {},
          fail(error: any) {
            if (
              _this.errorCallback &&
              isFunc(_this.errorCallback)
            ) {
              _this.errorCallback(error)
            }
            throw error
          }
        }
      )
    })
  }

  private _getFrom() {
    // @ts-ignore
    this.pages = getCurrentPages()
    const len = this.pages.length
    if (len === 0) return null
    return this.pages[len - 1].route
  }
}

export default Router
