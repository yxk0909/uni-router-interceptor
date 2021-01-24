# uni-router-interceptor
a simple router interceptor for uni-app

uni-router-interceptor 是一个基于uni-app框架的纯路由拦截插件  
由于自己的项目需要一个类似 vue-router 的路由拦截功能，本人考察了 uni 插件市场的大部分这一类的插件，发现
很多插件都配置特别繁琐，并且编译成微信小程序后还有路由层级限制，最多只能  `navigateTo` 十层，这就让自己很难受了，于是自己也有了造一个轮子的想法。  


解决这个问题我的思路是到10层时直接 `reLaunch` 清空一下路由栈，自己把路由的历史记录保存起来，方便进行路由回退  
如果有更好的方法，欢迎各位大佬提出意见

> 本插件的本质还是 uni 的自带路由，只是对 uni 的自带路由进行了包装  

# 基本使用  
下载插件后直接导入即可用法基本和 Vue-Router 一样

```javascript
// router.js 定义路由

import Router from './router/index.js'

export default new Router({
  homePage: '' // 首页的page路由
})
```

在 `main.js` 中导入 router

```javascript
Vue.use(router)
```

之后就可以抛弃 `uni.navigateTo()` 这样的uni自带路由跳转方法，改成 `this.$Router.navigateTo()` 进行愉快的使用啦  
并且 uni 自带路由跳转参数基本全部都支持。其中 `this.$Router` 中的路由方法完全和 uni 自带的一样  

```javascript
// 保留当前页面，跳转到应用内的某个页面
this.$Router.navigateTo({
  url: '/pages/index/index',
  query: {} // 路由传参
})

// 关闭当前页面，跳转到应用内的某个页面
this.$Router.redirectTo({
  url: '/pages/index/index',
  query: {} // 路由传参
})

// 关闭所有页面，打开到应用内的某个页面。
this.$Router.reLaunch({
  url: '/pages/index/index',
  query: {} // 路由传参
})

// 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
this.$Router.switchTab({
  url: '/pages/index/index'
})

// 关闭当前页面，返回上一页面或多级页面
this.$Router.navigateBack()

// 预加载页面
this.$Router.preloadPage({
  url: '/pages/index/index'
})
```

路由传递的 query 参数获取可以参照[uni 自带的参数获取方法](https://uniapp.dcloud.io/collocation/frame/lifecycle?id=%e9%a1%b5%e9%9d%a2%e7%94%9f%e5%91%bd%e5%91%a8%e6%9c%9f)

```javascript
onLoad(options) {
  // options 路由参数
}
```

> Tips: 如果不需要传递参数，可以直接使用 this.$Router.navigateTo('/pages/index/index')

# 路由拦截  

```javascript
// 路由前置拦截器
router.beforeEach((to, from, next) => {
  // TODO something
  next() // 必须执行 next() 否则路由不会跳转
})

// 路由后置拦截器
router.afterEach((to, from) => {
  // TODO something
})

// 捕获路由错误信息
router.error(() => {
  // TODO something
})
```

* to 目标路由跳转信息
* from 当前路由对象
* next 路由放行，执行跳转操作

> this.$Router.pages // 当前页面栈的实例  
> this.$Router.history // 路由历史记录信息
