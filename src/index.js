/**
 * uni app 简单实现路由导航守卫，和路由历史记录
 * @desc 实例挂载到 Vue 原型的$Router下，使用方法类似 vue-router
 * @version 1.0.1
 * @author yxk
 * @date 2020/01/25
 */
import {
  isObject,
  isEmpty,
  deepCopy
} from './types.js'

/**
 * 拼接路由Query参数
 * @param {Object} params
 * @return {Object}
 */
const getRealParams = function(params) {
  if (isEmpty(params.query)) return params
  const data = deepCopy(params)
  const query = data.query || {}
  delete data.query
  const arr = []
  Object.keys(query).forEach(key => {
    if (!isEmpty(query[key]) && !isObject(query[key])) {
      arr.push(`${key}=${query[key]}`)
    }
  })
  let str = ''
  if (arr.length > 0) {
    str = arr.join('&')
    str = '?' + str
  }
  return {
    ...data,
    url: data.url + str
  }
}

export default class Router {
  /**
   * @param {Object} config  Router配置
   * @param {String} config.homePage 路由主页
   */
  constructor(config = {}) {
    this.config = config

    // 页面栈最多允许十层
    // @see https://uniapp.dcloud.io/api/router?id=navigateto
    // @see https://developers.weixin.qq.com/miniprogram/dev/api/route/wx.navigateTo.html
    this.maxlength = 10

    this.beforeEachCallback = () => {}
    this.afterEachCallback = () => {}
    this.errorCallback = error => {
      console.log('error', error)
    }
    this._nextFn = () => {} // 临时存储路由执行动作

    this.pages = [] // 当前页面栈的实例
    this.history = [] // 路由历史记录
    this._oldHistory = []
  }

  /**
   * 挂载 router 实例
   * @param {Object} Vue
   */
  install(Vue) {
    Vue.prototype.$Router = this
  }

  /**
   * uni navigateTo 路由钩子
   * @param {Object} params
   */
  navigateTo(params = {}) {
    const pages = getCurrentPages()

    this._initHistory(params)
    this.history.push(params)

    if (pages.length >= this.maxlength) {
      this._changeRouter('reLaunch', params)
    } else {
      this._changeRouter('navigateTo', params)
    }
  }

  /**
   * uni redirectTo 路由钩子
   * @param {Object} params
   */
  redirectTo(params = {}) {
    this._initHistory(params)
    const len = this.history.length
    this.history.splice(len - 1, 1, params)
    this._changeRouter('redirectTo', params)
  }

  /**
   * uni reLaunch 路由钩子
   * @param {Object} params
   */
  reLaunch(params = {}) {
    this._initHistory(params)
    this.history = [params]
    this._changeRouter('reLaunch', params)
  }

  /**
   * uni switchTab 路由钩子
   * @param {Object} params
   */
  switchTab(params = {}) {
    this._initHistory(params)
    this.history = [params]
    this._changeRouter('switchTab', params)
  }

  /**
   * uni navigateBack 路由钩子
   * @param {Object} params
   */
  navigateBack(params = {}) {
    const num = params.delta || 1
    const homePage = this.config.homePage || '/'
    const len = this.history.length
    if ((len - 1) >= num) {
      this.pages = getCurrentPages()
      this._oldHistory = deepCopy(this.history)
      if ((this.pages.length - 1) >= num) {
        this.history.splice(-num)
        uni.navigateBack(params)
      } else {
        const p = this.history[len - num - 1]
        this.history.splice(-num)
        this._changeRouter('reLaunch', p)
      }
    } else {
      this.reLaunch(homePage)
    }
  }

  /**
   * uni preloadPage 路由钩子
   * @param {Object} params
   */
  preloadPage(params = {}) {
    uni.preloadPage(params)
  }

  /**
   * 导航全局前置守卫
   * @param {function} func
   */
  beforeEach(func) {
    if (!func) return
    if (typeof func !== 'function') throw 'beforeEach callback must be a function!!'
    this.beforeEachCallback = func
  }

  /**
   * 导航全局后置守卫
   * @param {function} func
   */
  afterEach(func) {
    if (!func) return
    if (typeof func !== 'function') throw 'afterEach callback must be a function!!'
    this.afterEachCallback = func
  }

  /**
   * 导航守卫错误信息捕获
   * @param {function} func
   */
  error(func) {
    if (!func) return
    if (typeof func !== 'function') throw 'error callback must be a function!!'
    this.errorCallback = func
  }

  /**
   * 执行uni路由钩子
   * @param {string} type 路由钩子名
   * @param {Object} params 路由参数
   */
  _changeRouter(type, params) {
    const that = this
    const to = typeof params === 'string' ? {
      url: params
    } : params
    const from = this._getFromRoute()

    const nextFunc = () => {
      uni[type]({
        ...getRealParams(to),
        success: () => {
          that.afterEachCallback(to, from)
        },
        fail: err => {
          const len = that.history.length
          that.history = deepCopy(that._oldHistory)
          that.errorCallback(err, to, from)
        },
        complete: () => {
          that.pages = getCurrentPages()
        }
      })
    }
    this._runNext(to, from, nextFunc)
  }

  /**
   * 执行路由导航前置守卫
   */
  _runNext(to, from, next) {
    if (this.beforeEachCallback) {
      this.beforeEachCallback(to, from, next)
    } else {
      next()
    }
  }

  /**
   * 获取from路由
   */
  _getFromRoute() {
    this.pages = getCurrentPages()
    if (this.pages.length === 0) return null
    return this.pages[this.pages.length - 1].route
  }

  _initHistory(params) {
    if (typeof params === 'string') {
      params = {
        url: params
      }
    }
    if (this.history.length === 0) {
      const vm = getCurrentPages()[0]
      console.log('_initHistory vm:', vm)
      if (!vm) return
      this.history.push(getRealParams({
        url: vm.route,
        query: vm.options
      }))
    }
    this._oldHistory = deepCopy(this.history)
  }
}
