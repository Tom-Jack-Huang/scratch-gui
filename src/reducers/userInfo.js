import {LoadingState} from '@reducers/project-state';

const HL_USER = 'scratch-gui/userInfo/user';
const PS_LOGIN = 'scratch-gui/userInfo/pslogin';
const SHOW_SPIN = 'scratch-gui/userInfo/showSpin';
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
        default:
            return state;
    }
};
const setUserInfo = function (user) {
    return {
        type: HL_USER,
        user: user
    };
};

const isPassLogin = pslogin => ({
    type: PS_LOGIN,
    pslogin: pslogin
});

const isShowSpin = showSpin => ({
    type: SHOW_SPIN,
    showSpin: showSpin
});

export {
    reducer as default,
    initialState as userinfoInitialState,
    setUserInfo,
    isPassLogin,
    isShowSpin
};
