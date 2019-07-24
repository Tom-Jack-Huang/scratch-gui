/*
NOTE: this file only temporarily resides in scratch-gui.
Nearly identical code appears in scratch-www, and the two should
eventually be consolidated.
*/

import {injectIntl} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import AccountNavComponent from '../components/menu-bar/account-nav.jsx';

import defimag1 from '@image/defAccount1.png';

const AccountNav = function (props) {
    const {
        ...componentProps
    } = props;
    return (
        <AccountNavComponent
            {...componentProps}
        />
    );
};

AccountNav.propTypes = {
    classroomId: PropTypes.string,
    isEducator: PropTypes.bool,
    isRtl: PropTypes.bool,
    isStudent: PropTypes.bool,
    profileUrl: PropTypes.string,
    thumbnailUrl: PropTypes.string,
    username: PropTypes.string
};

const mapStateToProps = state => {
    const user = state.scratchGui.userInfo && state.scratchGui.userInfo.user;
    return {
        classroomId: user.classroomId ?
            user.classroomId : '',
        isEducator: false,
        isStudent: false,
        profileUrl: user.avator ?
            user.avator : '',
        thumbnailUrl: user.avatarThumb ?
            (user.avatarThumb === 'undefined'?defimag1:user.avatarThumb) : defimag1,
        username: user ?
            user.userName : ''
    };
};

const mapDispatchToProps = () => ({});

export default injectIntl(connect(
    mapStateToProps,
    mapDispatchToProps
)(AccountNav));
