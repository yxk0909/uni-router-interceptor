/**
 * @file uni-router-interceptor
 * @author yxk
 * @version 2.0.0.beta
 *  https://github.com/yxk0909/uni-router-interceptor.git
 */
import { RouteOptions } from './types';
declare class Router {
    version: string;
    /**
     * 主页路由
     */
    homePage: string;
    /**
     * 当前页面栈的实例数组
     */
    pages: any[];
    /**
     * 历史记录
     */
    history: any[];
    /**
     * 路由跳转前回调
     */
    beforeEachCallback: Function | undefined;
    /**
     * 路由跳转后回调
     */
    afterEachCallback: Function | undefined;
    /**
     * 路由跳转失败回调
     */
    errorCallback: Function | undefined;
    [key: string]: any;
    constructor(options: RouteOptions);
    install(Vue: any): void;
    beforeEach(callback: Function | unknown): void;
    afterEach(callback: Function | unknown): void;
    error(callback: Function | unknown): void;
    removeInterceptor(methodName: string | undefined): void;
    private _execMethod;
    private _addInterceptor;
    private _getFrom;
}
export default Router;
