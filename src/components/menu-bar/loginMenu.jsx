import React, {Component} from 'react';
import {Form, Input, Modal, message, Button} from 'antd';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import {setUserInfo, isPassLogin,isShowSpin} from '@reducers/userInfo';
import classNames from 'classnames';
import Cookies from 'js-cookie';
import Outils from 'outils';
import {isShuZi} from '@hlTools/myTools';
import {getCaptcha, userLogin, getAvatar} from '@apis';
import './LoginMenu.less';

const FormItem = Form.Item;

class LoginMenu extends Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'submitLogin',
            'cancelClick',
            'requestUrl',
            'onChangeLoginType',
            'cancleAlertText',
            'onGetCaptchaClick',
            'checkPhone',
            'checkOtherInput'
        ]);
        this.state = {
            alertText: '',
            CaptchaText: '获取验证码',
            testCap: '',
            capBtnAble: false,
            loginTYpe: '0'
        };
    }

    submitLogin (e) {
        //阻止事件冒泡
        e.stopPropagation();

        this.props.form.validateFields((err, values) => {

            if (this.checkPhone(values.userName) && this.checkOtherInput(values.passWord)) {
                this.requestUrl(values);
            }
        });

    };

    checkPhone (str) {
        let pass = true;
        if (str === '') {
            // message.error('请输入手机号');
            this.setState({
                alertText: '请输入手机号'
            });
            pass = false;
        } else if (!Outils.isPhoneNum(str)) {
            this.setState({
                alertText: '手机号格式不正确'
            });
            pass = false;
        }
        return pass;
    }

    checkOtherInput (str) {
        let pass = true;
        if (str === '') {
            if (this.props.pslogin) {
                this.setState({
                    alertText: '请输入密码'
                });
            } else {
                this.setState({
                    alertText: '请输入验证码'
                });
            }
            pass = false;
        } else {
            if (this.props.pslogin && (str.length < 6)) {
                this.setState({
                    alertText: '密码格式有误'
                });
                pass = false;
            } else {
                if (str.length !== 6) {
                    this.setState({
                        alertText: '验证码格式有误'
                    });
                    pass = false;
                } else if (!isShuZi(str)) {
                    this.setState({
                        alertText: '验证码格式有误'
                    });
                    pass = false;
                }

            }
        }
        return pass;
    }

    cancleAlertText () {
        this.setState({
            alertText: ''
        });
    }

    cancelClick (e) {
        //阻止事件冒泡
        e.stopPropagation();
        this.props.closeLoginMenu();

    };

    onGetCaptchaClick (e) {
        e.stopPropagation();

        this.props.form.validateFields((err, values) => {

            if (this.checkPhone(values.userName)) {
                let timeStr = 60;
                this.setState({
                    capBtnAble: true
                });
                let interval = setInterval(() => {
                    if (timeStr <= 0) {
                        clearInterval(interval);
                        this.setState({
                            CaptchaText: '获取验证码',
                            capBtnAble: false
                        });
                    } else {
                        this.setState({
                            CaptchaText: timeStr + '秒'
                        });
                    }
                    timeStr--;
                }, 1000);


                getCaptcha(values.userName)
                    .then(res => {
                        if (res.status === 0) {
                            message.success('短信发送成功');
                            this.setState({
                                testCap: res.msg
                            });
                        } else {
                            message.error(res.msg);
                            this.setState({
                                CaptchaText: '获取验证码',
                                capBtnAble: false
                            });
                        }
                    })
                    .catch(err => {
                        message.error('短信发送失败');

                        clearInterval(interval);
                        this.setState({
                            CaptchaText: '获取验证码',
                            capBtnAble: false
                        });
                    });

            }
        });

    }


    onChangeLoginType () {
        this.props.changePassLogin(!this.props.pslogin);
        if (this.props.pslogin) {
            this.setState({
                loginTYpe: '1'
            });
        } else {
            this.setState({
                loginTYpe: '0'
            });
        }
    }

    requestUrl (values) {
        //
        // Cookies.set('JSESSIONID', '123');
        //
        this.props.onChangeSowSpin(true);
        userLogin({
            type: this.state.loginTYpe,
            mobile: values.userName,
            captcha: values.passWord,
            password: values.passWord
        })
            .then(res => {
                this.props.onChangeSowSpin(false);
                if (res.status === 0) {
                    let expireDate = new Date();
                    expireDate.setTime(expireDate.getTime() + res.data.expires * 1000);
                    Cookies.set('mobile', values.userName, {expires: 30, path: '/'});
                    Cookies.set('firstLogin', res.data.firstLogin, {expires: expireDate, path: '/'});
                    Cookies.set('token', res.data.token, {expires: expireDate, path: '/'});
                    Cookies.set('nickName', res.data.nickName, {expires: expireDate, path: '/'});
                    Cookies.set('avatarThumb', res.data.avatarThumb, {expires: expireDate, path: '/'});
                    Cookies.set('avator', res.data.avator, {expires: expireDate, path: '/'});
                    Cookies.set('userName', values.userName, {expires: expireDate, path: '/'});

                    let users = {
                        token: res.data.token,
                        avatarThumb:res.data.avatarThumb,
                        firstLogin:res.data.firstLogin,
                        mobile:values.userName,
                        nickName:res.data.nickName,
                        avator:res.data.avator,
                        userName:values.userName
                    };
                    this.props.userInfo(users);
                    this.props.closeLoginMenu();
                }
            })
            .catch(err => {
                this.props.onChangeSowSpin(false);
                message.error('登录失败');
            });
    };


    render () {
        const {getFieldDecorator} = this.props.form;
        const bodyStyle = {
            top: '40%',
            width: '540px',
            height: '520px',
            borderRadius: '5px',
            padding: '0'
        };
        return (
            <div onClick={this.cancleAlertText}>
                <Modal
                    visible={this.props.visible}
                    onCancel={(e) => this.cancelClick(e)}
                    footer={null}
                    closable={false}
                    width="540px"
                    bodyStyle={bodyStyle}
                    destroyOnClose={true}
                    maskClosable={false}

                >
                    <div className="theme-poptit">
                        <a
                            href="javascript:void(0);"
                            title="关闭"
                            className="close"
                            onMouseUp={(e) => this.cancelClick(e)}
                        >
                            ×
                        </a>
                        <h3>登&nbsp;&nbsp;录</h3>
                    </div>

                    <Form layout="horizontal" className="theme-popbod dform theme-signin">
                        <FormItem>
                            {
                                getFieldDecorator('userName',
                                    {
                                        initialValue: ''
                                        // rules: [
                                        //     {required: true}
                                        // ]
                                    })(
                                    <Input
                                        className="ipt"
                                        placeholder="请输入手机号"
                                        size="small"
                                    />
                                )
                            }
                        </FormItem>
                        <FormItem style={{marginBottom: '0'}}>
                            {
                                getFieldDecorator('passWord',
                                    {
                                        initialValue: this.state.testCap
                                        // rules: [
                                        //     {required: true}
                                        // ]
                                    })(
                                    this.props.pslogin ? (
                                        <div>
                                            <Input
                                                placeholder="请输入密码"
                                                className="ipt"
                                                size="small"
                                            />
                                            <span className="alert-text">
                                              {this.state.alertText}
                                           </span>
                                        </div>
                                    ) : (<div>
                                        <div>
                                            <Input
                                                placeholder="请输入短信验证码"
                                                className="ipt"
                                                style={{width: '225px', float: 'left'}}
                                                size="small"
                                                value={this.state.testCap}
                                            />
                                            <Button className="in_left"
                                                    onClick={(e) => this.onGetCaptchaClick(e)}
                                                    disabled={this.state.capBtnAble}
                                            >
                                                {this.state.CaptchaText}
                                            </Button>
                                        </div>
                                        <span className="alert-text">
                                              {this.state.alertText}
                                           </span>
                                    </div>)
                                )
                            }
                        </FormItem>
                        <FormItem style={{marginBottom: '10px'}}>

                            <Button
                                shape="round"
                                type="primary"
                                className="btn-primary"
                                onClick={(e) => this.submitLogin(e)}
                            >
                                快捷登录
                            </Button>
                        </FormItem>
                        <FormItem style={{textAlign: 'right'}}>
                            <Button type="link" onClick={this.onChangeLoginType}>
                                {this.props.pslogin ? '使用验证码登录' : '使用密码验证登录'}
                            </Button>
                        </FormItem>
                    </Form>
                </Modal>
            </div>
        );
    }
}

LoginMenu.propTypes = {
    visible: PropTypes.bool,
    closeLoginMenu: PropTypes.func,
    userInfo: PropTypes.func,
    pslogin: PropTypes.bool,
    changePassLogin: PropTypes.func,
    onChangeSowSpin:PropTypes.func
};
const mapDispatchToProps = dispatch => ({

    userInfo: user => dispatch(setUserInfo(user)),
    changePassLogin: pslogin => {
        dispatch(isPassLogin(pslogin));
    },
    onChangeSowSpin: loading => {
        dispatch(isShowSpin(loading));
    }
});
const mapStateToProps = (state) => {
    const pslogin = state.scratchGui.userInfo && state.scratchGui.userInfo.pslogin;
    return {
        pslogin: pslogin
    };
};

export default Form.create()(connect(mapStateToProps, mapDispatchToProps)(LoginMenu));
