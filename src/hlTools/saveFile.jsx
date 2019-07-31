import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {projectTitleInitialState} from '@reducers/project-title';
import {connect} from 'react-redux';
import bindAll from 'lodash.bindall';
import {uploadSB3File, work_info, upload_image} from '@apis';
import {isShowSpin, setWorkNo} from '@reducers/userInfo';
import {message} from 'antd';
import domToImage from 'dom-to-image';
import {convertBase64UrlToBlob} from '@hlTools/myTools';

class SaveFile extends Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'downloadProject',
            'saveProjectInfoToServer',
            'uploadImageToServer',
            'errorAlert'
        ]);
        this.state = {
            visible: true
        };
    }

    downloadProject () {

        this.props.onChangeSowSpin(true);
        this.props.saveProjectSb3()
            .then(content => {
                //保存文件
                uploadSB3File(content)
                    .then(res => {
                        if (res.status === 0) {
                            this.uploadImageToServer(res.data.host + res.data.path);
                        } else {
                            this.errorAlert();
                        }

                    })
                    .catch(err => {
                        this.errorAlert();
                    });
            });

    }

    //保存项目截图
    uploadImageToServer (fileUrl) {
        this.props.vm.runtime.renderer.draw();
        let canvasObj = this.props.vm.runtime.renderer._gl.canvas;
        domToImage.toPng(canvasObj, null)
            .then(dataUrl => {
                let timestamp = new Date().getTime();
                upload_image(convertBase64UrlToBlob(dataUrl, timestamp + '.png'))
                    .then(res => {
                        console.log(res);
                        if (res.status === 0) {
                            this.saveProjectInfoToServer(fileUrl,
                                res.data.host + res.data.path,
                                res.data.host+res.data.thumbPath);
                        } else  {
                            this.errorAlert();
                        }
                    })
                    .catch(err => {
                        this.errorAlert();
                    });

            })
            .catch(err => {
                this.errorAlert();
            });
        //


    }

    //保存项目相关信息
    saveProjectInfoToServer (fileUrl,imagePath,imageThumbPath) {
        let name = '';
        //去除文件名中的.sb3
        if (this.props.projectFilename) {
            name = this.props.projectFilename.replace('.sb3', '');
        }
        work_info({
            name: name,
            url: fileUrl,
            type: 0,
            workNo: this.props.workNo,
            logo:imagePath,
            logoThumb:imageThumbPath
        })
            .then(res => {
                console.log(res);
                this.props.onChangeSowSpin(false);
                if (res.status === 0) {
                    message.success('保存成功');
                    this.props.onSetProjectNo(res.data.workNo);
                } else {
                    this.errorAlert();
                }

            })
            .catch(err => {
                this.errorAlert();
            });
    }

    errorAlert(){
        this.props.onChangeSowSpin(false);
        message.error('保存失败,请稍后再试');
    }

    render () {
        const {
            children
        } = this.props;
        return children(
            this.props.className,
            this.downloadProject
        );
    }
}

const getProjectFilename = (curTitle, defaultTitle) => {
    let filenameTitle = curTitle;
    if (!filenameTitle || filenameTitle.length === 0) {
        filenameTitle = defaultTitle;
    }
    return `${filenameTitle.substring(0, 100)}.sb3`;
};

SaveFile.propTypes = {
    children: PropTypes.func,
    className: PropTypes.string,
    onSaveFinished: PropTypes.func,
    projectFilename: PropTypes.string,
    saveProjectSb3: PropTypes.func,
    onChangeSowSpin: PropTypes.func,
    onSetProjectNo: PropTypes.func,
    vm: PropTypes.shape({
        loadProject: PropTypes.func
    })
};
SaveFile.defaultProps = {
    className: ''
};

const mapStateToProps = state => ({
    saveProjectSb3: state.scratchGui.vm.saveProjectSb3.bind(state.scratchGui.vm),
    projectFilename: getProjectFilename(state.scratchGui.projectTitle, projectTitleInitialState),
    workNo: state.scratchGui.userInfo.workNo ? state.scratchGui.userInfo.workNo : '',
    vm: state.scratchGui.vm
});
const mapDispatchToProps = dispatch => ({

    onChangeSowSpin: loading => {
        dispatch(isShowSpin(loading));
    },
    onSetProjectNo: id => dispatch(setWorkNo(id))
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SaveFile);

