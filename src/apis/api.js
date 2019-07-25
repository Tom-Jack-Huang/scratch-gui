import {getAB, get, post} from '@hlTools/HLAxios.js';

/**
 * 从服务区获取sb3文件
 * @returns {Promise<any | never>}
 */
const autoLoadab3 = () => {
    return getAB('uploads/lqyx.sb3');
};
/**
 * 左侧代码显示控制
 * @returns {Promise<any | never>}
 */
const getleftData = () => {
    return get('getleftData');
};

/**
 * 获取验证码
 * @param mobile
 */
const getCaptcha = (mobile) => {
    let urlStr = '/edu/login/captcha/' + mobile;
    return get(urlStr);
};

/**
 * 用户登录
 * @param params
 * @returns {Promise<any | never>}
 */
const userLogin = (params) => {
    return post('/edu/login', params);
};

const getAvatar = () => {
    return get('/edu/user/avatar');
};

export {
    autoLoadab3,
    getleftData,
    getCaptcha,
    userLogin,
    getAvatar
};
