import {LoadingState} from '@reducers/project-state';

const HL_USER = 'scratch-gui/userInfo/user';
const PS_LOGIN = 'scratch-gui/userInfo/pslogin';
const SHOW_SPIN = 'scratch-gui/userInfo/showSpin';
const WORK_NO = 'scratch-gui/userInfo/workNo';
const CANVAS_OBJECT = 'scratch-gui/userInfo/canvasObject';
const initialState = {
    user: {},
    pslogin: false,
    showSpin:false
};
const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
        case HL_USER:
            return Object.assign({}, state, {
                user: action.user
            });
        case PS_LOGIN: {
            return Object.assign({}, state, {
                pslogin: action.pslogin
            });
        }
        case SHOW_SPIN:{
            return Object.assign({}, state, {
                showSpin: action.showSpin
            });
        }
        case WORK_NO:{
            return Object.assign({}, state, {
                workNo: action.workNo
            });
        }
        case CANVAS_OBJECT:{
            return Object.assign({}, state, {
                canvasObject: action.canvasObject
            });
        }
        default:
            return state;
    }
};
/**
 * 用户信息
 * @param user
 * @returns {{type: *, user: *}}
 */
const setUserInfo = function (user) {
    return {
        type: HL_USER,
        user: user
    };
};
/**
 * 登录状态
 * @param pslogin
 * @returns {{pslogin: *, type: *}}
 */
const isPassLogin = pslogin => ({
    type: PS_LOGIN,
    pslogin: pslogin
});
/**
 * 展示loading
 * @param showSpin
 * @returns {{showSpin: *, type: *}}
 */
const isShowSpin = showSpin => ({
    type: SHOW_SPIN,
    showSpin: showSpin
});

/**
 * 项目编号
 * @param workNo
 * @returns {{workNo: *, type: *}}
 */
const setWorkNo = workNo =>({
    type: WORK_NO,
    workNo:workNo
});

/**
 * 存储canvas方便用于截取图片
 * @param obj
 * @returns {{type: *, canvasObject: *}}
 */
const setCanvasObject = obj =>({
    type: CANVAS_OBJECT,
    canvasObject:obj
});

export {
    reducer as default,
    initialState as userinfoInitialState,
    setUserInfo,
    isPassLogin,
    isShowSpin,
    setWorkNo,
    setCanvasObject
};
