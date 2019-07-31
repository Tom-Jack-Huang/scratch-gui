import React, {Component} from 'react';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import {connect} from 'react-redux';
import {injectIntl} from 'react-intl';

import {
    openLoadingProject,
    closeLoadingProject
} from '../reducers/modals';
import {LoadingStates, onLoadedProject} from '../reducers/project-state';
import {autoLoadab3, get_work_info} from '@apis';


class autoLoadFile extends Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'checkWorkInfoState',
            'loading'
        ]);

    }

    componentDidMount () {
        setTimeout(this.checkWorkInfoState, 1500);
    }

    checkWorkInfoState () {
        //如果存在项目编号  就去获取项目
        if (this.props.workNo && this.props.workNo.length > 0) {
            console.log(this.props.workNo);
            get_work_info(this.props.workNo)
                .then(res => {
                    console.log(res);
                    if (res.status === 0) {
                        this.loading(res.data.name, res.data.url);
                        // window.location.href='http://192.168.2.170:8088/edu/work/settlement.html';
                    }
                })
                .catch(err => {

                });
        }
    }


    loading (name, url) {
        this.props.onLoadingStarted();

        autoLoadab3(url)
            .then((res) => {
                this.props.vm.loadProject(res)
                    .then(() => {
                        this.props.onLoadingFinished(this.props.loadingState, true);
                        // // Reset the file input after project is loaded
                        // // This is necessary in case the user wants to reload a project
                        if (name) {
                            this.props.onUpdateProjectTitle(name);
                        }
                    })
                    .catch(error => {
                        // log.warn(error);
                        this.props.onLoadingFinished(this.props.loadingState, true);
                    });
            });
    }

    render () {
        return (
            <div>
            </div>
        );
    }
}

autoLoadFile.propTypes = {
    vm: PropTypes.shape({
        loadProject: PropTypes.func
    }),
    onLoadingFinished: PropTypes.func,
    onLoadingStarted: PropTypes.func,
    loadingState: PropTypes.oneOf(LoadingStates),
    onUpdateProjectTitle: PropTypes.func
};
const mapStateToProps = state => {
    const loadingState = state.scratchGui.projectState.loadingState;

    return {
        projectChanged: state.scratchGui.projectChanged,
        vm: state.scratchGui.vm,
        loadingState: loadingState,
        workNo: state.scratchGui.userInfo.workNo ? state.scratchGui.userInfo.workNo : null
    };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
    onLoadingStarted: () => dispatch(openLoadingProject()),
    onLoadingFinished: (loadingState, success) => {
        dispatch(onLoadedProject(loadingState, success));
        dispatch(closeLoadingProject());
    }
});

// Allow incoming props to override redux-provided props. Used to mock in tests.
const mergeProps = (stateProps, dispatchProps, ownProps) => Object.assign(
    {}, stateProps, dispatchProps, ownProps
);
export default connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
)(injectIntl(autoLoadFile));
