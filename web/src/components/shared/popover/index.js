import React, {Component} from 'react'
import Manager from './manager'
import Target from './target'
import Popper from './popper'
import Arrow from './arrow'
import PropTypes from 'prop-types';
import outy from './outy'
import styled from 'styled-components'
import {color} from "../../theme";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {ON_CLOSE_POPOVER} from "../../../redux/reducers/app";

const Content = styled.div `
    box-shadow: 0 1px 4px rgba(0, 0, 0, .3);
    border: 1px solid ${color.border};    
`

class Popover extends Component {

    constructor(props) {
        super(props);


        this.state = {
            isOpen: false,
        }

        this._handleTargetClick = this._handleTargetClick.bind(this);
        this._setOutsideTap = this._setOutsideTap.bind(this);
        this._handleOutsideTap = this._handleOutsideTap.bind(this);
        this._onClose = this._onClose.bind(this)
    }

    _onClose() {
        this._handleOutsideTap();
    }


    componentDidMount() {
        this.props.app.event.on(ON_CLOSE_POPOVER, this._onClose)
        this._setOutsideTap()
    }

    componentDidUpdate(lastProps, lastState) {

        if (lastState.isOpen !== this.state.isOpen) {
            setTimeout(() => this._setOutsideTap())
        }
    }

    componentWillUnmount() {
        this.props.app.event.off(ON_CLOSE_POPOVER, this._onClose);
        this.outsideTap.remove()
    }

    _setOutsideTap = () => {
        const elements = [this.target]

        if (this.popper && this.props.includePopper) {
            elements.push(this.popper)
        }

        if (this.outsideTap) {
            this.outsideTap.remove()
        }

        this.outsideTap = outy(
            elements,
            ['click', 'touchstart'],
            this._handleOutsideTap
        )
    }

    _handleOutsideTap = () => {
        const {showOnHover} = this.props;
        if (!showOnHover) {
            if (this.props.onClose) {
                this.props.onClose();
            }
            this.setState({isOpen: false})
        }

    }

    _handleTargetClick = () => {
        const {showOnHover} = this.props;
        if (!showOnHover) {
            if (this.props.onOpen) {
                this.props.onOpen();
            }
            this.setState({isOpen: true})
        }

    }

    render() {

        const {isOpen} = this.state;

        const {target, content, placement, showOnHover} = this.props;
        return (
            <Manager onMouseLeave={() => {
                if (showOnHover) {

                    this.setState({isOpen: false})
                }
            }} ref={(ref) => this.ref = ref}>
                <Target innerRef={comp => this.target = comp}
                        onClick={this._handleTargetClick}>
                    {({targetProps}) => (
                        <div
                            onMouseOver={() => {

                                if (showOnHover) {
                                    this.setState({isOpen: true})
                                }
                            }}
                            onClick={this._handleTargetClick} {...targetProps}>
                            {target}
                        </div>
                    )}
                </Target>
                {isOpen && (
                    <Popper innerRef={(popper) => this.popper = popper} placement={placement ? placement : 'bottom'}>
                        {({popperProps, restProps}) => (
                            <div
                                className={`app-popover popper popover-${placement}`}
                                {...popperProps}
                            >
                                <Content className={'popover-content'}>
                                    {content}
                                </Content>
                                <Arrow>
                                    {({arrowProps, restProps}) => (
                                        <span
                                            className="popper__arrow"
                                            {...arrowProps}
                                        />
                                    )}
                                </Arrow>
                            </div>
                        )}
                    </Popper>
                )
                }
            </Manager>
        )

    }
}

Popover.propTypes = {
    placement: PropTypes.string,
    target: PropTypes.any,
    content: PropTypes.any,
    showOnHover: PropTypes.bool,
    includePopper: PropTypes.bool,
};


const mapStateToProps = (state, props) => ({
    app: state.app,
});

const mapDispatchToProps = dispatch => bindActionCreators({}, dispatch);


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Popover)