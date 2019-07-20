import {getAB,get} from '@hlTools/HLAxios.js';

const autoLoadab3 = ()=>{
    return getAB('uploads/lqyx.sb3');
};

const getleftData = ()=>{
    return get('getleftData');
};

export {
    autoLoadab3,
    getleftData
}
