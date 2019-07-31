import axios from 'axios';
import {message, Spin} from 'antd';
import Cookies from 'js-cookie';


const instance = axios.create({
    baseURL: 'http://192.168.2.170:8088/',
    timeout: 60*1000
});


// 全局设定请求类型
instance.defaults.headers.post['Content-Type'] = 'application/json';
instance.defaults.headers.get['Content-Type'] = 'application/json';

//请求权限
let token = Cookies.get('token');
if (token) {
    instance.defaults.headers.post['Authorization'] = 'Bearer ' + token;
    instance.defaults.headers.get['Authorization'] = 'Bearer ' + token;
}


// 根据 axios api，对请求返回做拦截处理
instance.interceptors.response.use(function (response) {
    if (response.status >= 400 && response.status < 500) {
        // 对返回状态码为 4xx 的请求统一处理
        // 此处统一跳转 404 页面
        // window.location.href = decodeURI(`${window.location.protocol}//${window.location.host}/404.html`)
    } else {
        return response;
    }
}, function (error) {
    // message.error(error);
    return error;
});

/**
 * get
 * @param url
 * @param params
 * @returns {Promise<AxiosResponse<T>>}
 */
export function get (url, params = {}) {
    // 开始 loading
    // proxyUtil.startLoading()
    return instance.get(url, {
        params: params,
        validateStatus: function (status) {
            // axios 底层采用 Promise 实现，下方表达式表示只有返回 code 为 2xx 才被正常返回（resolve），非 2xx 全部当做异常（reject）
            return status >= 200 && status < 300;
        }
    })
        .then(response => {
            if (response && response.status === 200) {
                return response.data;
            } else {
                return {status: 500};
            }
        })
        .catch(error => {
            return error;
        });
}

/**
 * post
 * @param url
 * @param params
 * @returns {Promise<AxiosResponse<T>>}
 */
export function post (url, params = {}) {

    return instance.post(url, params)
        .then(response => {
            if (response && response.status === 200) {
                return response.data;
            } else {
                return {status: 500};
            }
        })
        .catch(error => {
            return error;
        });
}

/**
 * 获取sb3文件
 * @param url
 * @param params
 * @returns {Promise<AxiosResponse<T>>}
 */
export function getAB (url, params = {}) {
    console.log(url);
    return instance.get(url, {
        params: params,
        responseType: 'arraybuffer'
    })
        .then(response => {

            if (response && response.status === 200) {
                return response.data;
            } else {
                return {status: 500};
            }
        })
        .catch(error => {
            console.log(error);
            return error;
        });
}

/**
 * 上传文件
 * @param url
 * @param fileName
 * @param file
 * @returns {Promise<AxiosResponse<T>>}
 */
export function uploadFile (url,file) {
    let form = new FormData();
    form.append('file', file);
    return instance.post(url, form, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer ' + token
        }
    })
        .then(response => {

            if (response && response.status === 200) {
                return response.data;
            } else {
                return {status: 500};
            }

        })
        .catch(error => {
            return error;
        });
}
