/**
 * @file 常用类型判断工具
 * @author yxk
 */
/**
 * 判断是否为数组
 * @param {any} data
 * @returns {boolean}
 */
export declare function isArray(data: any): boolean;
/**
 * 判断是否为 object
 * @param {any} data
 * @returns {boolean}
 */
export declare function isObject(data: any): boolean;
/**
 * 判断是否为函数
 * @param {any} func 参数
 * @returns {boolean}
 */
export declare function isFunc(func: any): boolean;
/**
 * 判断是否为空
 * @description 空数组 空对象 去掉首尾空格的空字符串 都为记为空
 * @param {any} data
 * @returns {boolean}
 */
export declare function isEmpty(data: any): boolean;
/**
 * 对象深拷贝
 * @param {any} target 被拷贝的对象
 * @returns {any} 拷贝结果
 */
export declare function deepCopy<T>(target: T): T;
