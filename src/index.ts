/**
 * @file uni-router-interceptor
 * @desc 实例挂载到 Vue $Router下，使用方法类似 vue-router
 * @author yxk
 * @version 2.0.0.beta
 * @date 2023/03/11
 * @see https://github.com/yxk0909/uni-router-interceptor.git
 */
import { ExtendObject, RouteParams } from './types'
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
 * 路由配置项
 * @property {string} homePage 首页path
 */
interface RouteOptions {
  homePage?: string
}

/**
 * 处理路由跳转的参数
 * @param {RouteParams|string|number|undefined} params
 * @return {*}
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

  const search: string = arr.length > 0 ? `?${arr.join('&')}` : ''
  return {
    ...data,
    url: data.url + search
  }
}

class Router {
  static version: string =  VERSION

  static maxlength: number = 10

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
  private beforeEachCallback: Function | undefined

  /**
   * 路由跳转后回调
   */
  private afterEachCallback: Function | undefined

  /**
   * 路由跳转失败回调
   */
  private errorCallback: Function | undefined

  private _historyFunc: Function | undefined

  private isNativeMethod: boolean

  [key: string]: any

  constructor(options: RouteOptions | null) {
    this.homePage = options ? options.homePage || '/' : '/'

    this.pages = []
    this.history = []
    this.beforeEachCallback = undefined
    this.afterEachCallback = undefined
    this.errorCallback = undefined
    this.isNativeMethod = true

    this._addInterceptor()

    INTERCEPTOR_API.forEach(key => {
      this[key] = (params: string | number | undefined | RouteParams) => this._execMethod(key, params)
    })
  }

  public install(Vue: any): void {
    const version = Number(Vue.version.split('.')[0])
    if (version < 3) {
      // Vue 2.x
      Vue.prototype.$Router = this
    } else {
      // Vue 3.x
      Vue.config.globalProperties.$Router = this
    }

    this._initHistory()
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

  private _execMethod(key: string, params: string | number | undefined | RouteParams) {
    this._historyFunc = undefined
    // @ts-ignore
    this.pages = getCurrentPages()
    this.isNativeMethod = false

    if (key !== 'navigateBack') {
      if (!params) throw new Error(`the arguments of '${key}' is required`)
      if (typeof params === 'number') throw new Error(`the arguments of '${key}' cannot be a number`)

      const realParams: Object = getRealParams(params)
      console.log('exec params: ', realParams)

      if (key !== 'preloadPage') {
        this._historyFunc = () => this.history.push(realParams)
      }

      // @ts-ignore
      uni[key](realParams)
      return
    }

    // 单独处理 navigateBack
    let delta: number
    if (!params || typeof params === 'string') delta = 1
    else if (typeof params === 'number') delta = params
    else delta = params.hasOwnProperty('delta') ? (params.delta || 1) : 1
    if (delta === 0) return

    const pagesLen = this.pages.length
    const len = this.history.length
    if (delta < pagesLen) {
      // 返回的页面数小于路由栈长度，通过页面栈进行判断跳转
      if (delta >= len) {
        this._historyFunc = () => this._initHistory()
      } else {
        this._historyFunc = () => this.history.splice(-delta)
      }
      const temp: any = isObject(params) ? params : { delta }
      // @ts-ignore
      uni.navigateBack(temp)
    } else {
      // 返回的页面数大于路由栈长度，则通过历史记录进行判断跳转
      if (delta >= len) {
        this._historyFunc = () => this._initHistory()
        // @ts-ignore
        uni.reLaunch(getRealParams(this.homePage))
      } else {
        const p = this.history[len - delta - 1]
        this._historyFunc = () => this.history.splice(-delta)
        // @ts-ignore
        uni.reLaunch(p)
      }
    }
  }

  private _execError(error: Error) {
    this.isNativeMethod = true
    // 执行失败后回调
    if (
      this.errorCallback &&
      isFunc(this.errorCallback)
    ) {
      this.errorCallback(error)
    }
    throw error
  }

  private _addInterceptor() {
    const _this = this
    let to: any, from: any

    INTERCEPTOR_API.forEach(method => {
      // @ts-ignore
      uni.addInterceptor(
        method,
        {
          async invoke(args: any) {
            if (_this.isNativeMethod) {
              _this._execMethod(method, args)
              return
            }

            if (
              !_this.beforeEachCallback ||
              !isFunc(_this.beforeEachCallback)
            ) return args

            from = _this._getFrom()
            to = _this._getTo(args)

            const flag = await new Promise<boolean>((resolve) => {
              if (!_this.beforeEachCallback) return resolve(true)
              _this.beforeEachCallback(to, from, resolve)
            })
              .then((result: boolean = true) => result)
              .catch(err => {
                throw err
              })

            if (!flag) _this._execError(new Error(`The "${method}" method has been blocked in "beforeEach" function`))
            return args
          },
          success() {
            // 跳转成功后追加历史记录
            if (_this._historyFunc) {
              _this._historyFunc()
            }

            // 执行成功后回调
            if (
              _this.afterEachCallback &&
              isFunc(_this.afterEachCallback)
            ) {
              _this.afterEachCallback(to, from)
            }
          },
          fail(error: Error) {
            // 执行失败后回调
            _this._execError(error)
          },
          complete() {
            _this.isNativeMethod = true
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
    // @ts-ignore
    const vm = getCurrentPages()[len - 1]
    if (!vm) return
    return {
      url: vm.route,
      query: vm.options
    }
  }

  private _getTo(args: any) {
    let to: any = {}

    Object.keys(args).forEach(key => {
      if (!['success', 'fail', 'delta'].includes(key)) {
        to[key] = args[key]
      }
    })

    if (args.hasOwnProperty('delta')) {
      // @ts-ignore
      this.pages = getCurrentPages()
      const len = this.pages.length
      if (args.delta < len) {
        const vm = this.pages[len - args.delta - 1]
        to = {
          ...to,
          ...getRealParams({
            url: vm.route,
            query: vm.options
          })
        }
      } else {
        to = {
          ...to,
          ...deepCopy(this.history[this.history.length - 1 - args.delta])
        }
      }
    }

    return to
  }

  private _initHistory() {
    this.history = []
    // @ts-ignore
    const vm = getCurrentPages()[0]
    if (!vm) return

    this.history.push(getRealParams({
      url: vm.route,
      query: vm.options
    }))
  }
}

export default Router
