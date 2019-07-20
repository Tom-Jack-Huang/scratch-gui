import React, {Component} from 'react';
import {Form, Input, Modal, message, Button} from 'antd';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import {setUserInfo, isPassLogin} from '@reducers/userInfo';
import classNames from 'classnames';
import Cookies from 'js-cookie'
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
            'cancleAlertText'
        ]);
        this.state = {
            alertText: ''
        };
    }

    submitLogin (e) {
        //阻止事件冒泡
        e.stopPropagation();
        console.log('点击；额');
        this.props.form.validateFields((err, values) => {
            if (!err && values.userName !== '' && values.passWord !== '') {
                // console.log(values);
                this.props.closeLoginMenu();
                this.requestUrl(values);

            } else {
                if (values.userName === '') {
                    // message.error('请输入手机号');
                    this.setState({
                        alertText: '请输入手机号'
                    });
                } else {
                    if (this.props.pslogin) {
                        this.setState({
                            alertText: '请输入密码'
                        });
                    } else {
                        this.setState({
                            alertText: '请输入验证码'
                        });
                    }
                }
            }
        });
    };
    cancleAlertText(){
        this.setState({
            alertText: ''
        });
    }
    cancelClick (e) {
        //阻止事件冒泡
        e.stopPropagation();
        this.props.closeLoginMenu();
    };

    onChangeLoginType () {
        this.props.changePassLogin(!this.props.pslogin);
    }

    requestUrl (values) {
        console.log(values);
        this.props.userInfo(values);
        Cookies.set('JSESSIONID','123');
        Cookies.set('avatarThumb','123');
        Cookies.set('firstLogin','123');
        Cookies.set('mobile',values.userName);
        Cookies.set('token','123');
        Cookies.set('userName',values.userName);
        // get('',{
        //     userName:username,
        //     passWord:password
        // }).then(res=>{
        //
        // });
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
                                        initialValue: ''
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
                                        <Input
                                            placeholder="请输入短信验证码"
                                            className="ipt"
                                            style={{width: '225px', float: 'left'}}
                                            size="small"
                                        />
                                        <div className="in_left">
                                            <a href="javascript:void(0);">获取验证码</a>
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
    changePassLogin: PropTypes.func
};
const mapDispatchToProps = dispatch => ({
    // closeLoginMenu:()=>dispatch(closeLoginMenu()),
    userInfo: user => {
        dispatch(setUserInfo(user));
    },
    changePassLogin: pslogin => {
        dispatch(isPassLogin(pslogin));
    }
});
const mapStateToProps = (state) => {
    const pslogin = state.scratchGui.userInfo && state.scratchGui.userInfo.pslogin;
    return {
        pslogin: pslogin
    };
};

export default Form.create()(connect(mapStateToProps, mapDispatchToProps)(LoginMenu));
