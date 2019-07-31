import {getAB, get, post,uploadFile} from '@hlTools/HLAxios.js';

/**
 * 从服务区获取sb3文件
 * @returns {Promise<any | never>}
 */
const autoLoadab3 = url => {
    return getAB(url);
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
const getCaptcha = mobile => {
    let urlStr = '/edu/login/captcha/' + mobile;
    return get(urlStr);
};

/**
 * 用户登录
 * @param params
 * @returns {Promise<any | never>}
 */
const userLogin = params => {
    return post('/edu/login', params);
};

/**
 * 获取头像
 * @returns {Promise<AxiosResponse<T>>}
 */
const getAvatar = () => {
    return get('/edu/user/avatar');
};

/**
 * 上传文件
 * @param fileName 文件名
 * @param file 文件
 * @returns {Promise<AxiosResponse<T>>}
 */
const uploadSB3File = file=>{
  return  uploadFile('/file/file',file);
};

/**
 * 发布作品
 * @param params
 * @returns {Promise<AxiosResponse<T>>}
 */
const work_info = params=>{
  return post('/edu/work/info',params);
};

/**
 * 根据项目ID获取项目类容
 * @param workNo
 * @returns {Promise<AxiosResponse<T>>}
 */
const get_work_info = workNo =>{
    let url = '/edu/work/info/'+workNo;
   return get(url);
};

/**
 * 上传图片
 * @param file
 * @returns {Promise<AxiosResponse<T>>}
 */
const upload_image = file =>{
  return  uploadFile('/file/image',file);
};

export {
    autoLoadab3,
    getleftData,
    getCaptcha,
    userLogin,
    getAvatar,
    uploadSB3File,
    work_info,
    get_work_info,
    upload_image
};
