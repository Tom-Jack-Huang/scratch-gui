/*
* 是否全是数字
* */
const isShuZi= function (str) {
    return /^[0-9]*$/.test(str);
};
/*
* 是否全是汉字
* */
const isHanZi = function (str) {
   return /^[\u4e00-\u9fa5],{0,}$/.test(str);
};
/*
* 以字母开头，长度在6-18之间，只能包含字符、数字和下划线
* */
const isPassWord = function (str) {
    return /^[a-zA-Z]\w{5,17}$/.test(str);
};
/*
* 匹配帐号是否合法(字母开头，允许5-10字节，允许字母数字下划线)
* */
const isAccount = function (str) {
    return /^[a-zA-Z][a-zA-Z0-9_]{4,9}$/.test(str);
};
export {
    isShuZi,
    isHanZi,
    isPassWord,
    isAccount
}
