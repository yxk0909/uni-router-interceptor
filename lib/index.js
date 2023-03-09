import { deepCopy, isArray, isObject, isFunc } from './utils';
const VERSION = '2.0.0.beta';
const INTERCEPTOR_API = [
    'navigateTo',
    'redirectTo',
    'reLaunch',
    'switchTab',
    'navigateBack',
    'preloadPage'
];
/**
 * 处理路由跳转的参数
 * @param {RouteParams|string} params
 * @return {Object}
 */
const getRealParams = function (params) {
    if (typeof params === 'string')
        return { url: params };
    if (!isObject(params))
        throw new Error('The parameter of the route jump must be an object or a string');
    const data = deepCopy(params);
    const query = data.query || {};
    delete data.query;
    // 拼接处理路由的Query参数
    const arr = [];
    Object.keys(query).forEach(key => {
        let val = query[key];
        if (val === undefined || val === null)
            val = '';
        if (isObject(val) || isArray(val)) {
            val = encodeURIComponent(JSON.stringify(val));
        }
        arr.push(`${key}=${val}`);
    });
    const search = '?' + arr.join('&');
    return {
        ...data,
        url: data.url + search
    };
};
class Router {
    version;
    /**
     * 主页路由
     */
    homePage;
    /**
     * 当前页面栈的实例数组
     */
    pages;
    /**
     * 历史记录
     */
    history;
    /**
     * 路由跳转前回调
     */
    beforeEachCallback;
    /**
     * 路由跳转后回调
     */
    afterEachCallback;
    /**
     * 路由跳转失败回调
     */
    errorCallback;
    constructor(options) {
        this.version = VERSION;
        this.homePage = options.homePage || '/';
        this.pages = [];
        this.history = [];
        this.beforeEachCallback = undefined;
        this.afterEachCallback = undefined;
        this.errorCallback = undefined;
        INTERCEPTOR_API.forEach(key => {
            this[key] = (params) => this._execMethod(key, params);
        });
    }
    install(Vue) {
        const version = Number(Vue.version.split('.')[0]);
        if (version < 3) {
            // Vue 2.x
            Vue.prototype.$Router = this;
        }
        else {
            // Vue 3.x
            Vue.config.globalProperties.$Router = this;
        }
    }
    beforeEach(callback) {
        if (!callback) {
            this.beforeEachCallback = undefined;
            return;
        }
        if (!isFunc(callback))
            throw new Error('beforeEach callback must be a function !!');
        this.beforeEachCallback = callback;
    }
    afterEach(callback) {
        if (!callback) {
            this.afterEachCallback = undefined;
            return;
        }
        if (!isFunc(callback))
            throw new Error('afterEach callback must be a function !!');
        this.afterEachCallback = callback;
    }
    error(callback) {
        if (!callback) {
            this.errorCallback = undefined;
            return;
        }
        if (!isFunc(callback))
            throw new Error('error callback must be a function !!');
        this.errorCallback = callback;
    }
    removeInterceptor(methodName) {
        if (!methodName) {
            INTERCEPTOR_API.forEach(key => {
                // @ts-ignore
                uni.removeInterceptor(methodName);
            });
        }
        if (!INTERCEPTOR_API.includes(methodName))
            return;
        // @ts-ignore
        uni.removeInterceptor(methodName);
    }
    _execMethod(key, params) { }
    _addInterceptor() {
        const _this = this;
        let to, from, next;
        INTERCEPTOR_API.forEach(key => {
            // @ts-ignore
            uni.addInterceptor(key, {
                async invoke(args) { },
                success() { },
                fail(error) {
                    if (_this.errorCallback &&
                        isFunc(_this.errorCallback)) {
                        _this.errorCallback(error);
                    }
                    throw error;
                }
            });
        });
    }
    _getFrom() {
        // @ts-ignore
        this.pages = getCurrentPages();
        const len = this.pages.length;
        if (len === 0)
            return null;
        return this.pages[len - 1].route;
    }
}
export default Router;
