import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';

import {MenuItem as MenuItemComponent} from '../components/menu/menu.jsx';

class MenuItem extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'navigateToHref'
        ]);
    }
    navigateToHref () {
        if (this.props.href) {
            // window.location.href = this.props.href;
            window.open(this.props.href);
            this.props.onMenuClose();
        }
    }
    render () {
        const {
            children,
            className,
            onClick,
            onMenuClose
        } = this.props;
        const clickAction = onClick ? onClick : this.navigateToHref;
        return (
            <MenuItemComponent
                className={className}
                onClick={clickAction}
            >
                {children}
            </MenuItemComponent>
        );
    }
}

MenuItem.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    // can take an onClick prop, or take an href and build an onClick handler
    href: PropTypes.string,
    onClick: PropTypes.func,
    onMenuClose:PropTypes.func
};

export default MenuItem;
