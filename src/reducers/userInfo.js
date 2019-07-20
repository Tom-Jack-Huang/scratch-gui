import {LoadingState} from '@reducers/project-state';

const HL_USER = 'scratch-gui/userInfo/user';
const PS_LOGIN = 'scratch-gui/userInfo/pslogin'
const initialState = {
    user: {},
    pslogin:false
};
const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
        case HL_USER:
            return Object.assign({}, state, {
                user: action.user
            });
        case PS_LOGIN:{
            return Object.assign({}, state, {
                pslogin: action.pslogin
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

const isPassLogin = pslogin=>({
    type: PS_LOGIN,
    pslogin: pslogin
});

export {
    reducer as default,
    initialState as userinfoInitialState,
    setUserInfo,
    isPassLogin
};
