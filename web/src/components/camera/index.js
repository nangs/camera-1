import React, {Component} from 'react'
import styled from 'styled-components'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {getModels, requestDeleteModel, getManyModels, setModelCount, addModels} from "../../redux/actions/model";
import Sidebar from "../shared/sidebar";
import {color, sidebar, Spinner} from "../theme";
import _ from 'lodash'
import Popover from '../shared/popover'
import {ACTIVE_MENU} from "../../redux/reducers/app";
import {history} from "../../history";
import CameraItem from "./camera-item";

const Wrapper = styled.div `
    height: 100%;
`

const Main = styled.div `
    padding-left: ${props => props.sidebarIsOpen ? sidebar.width : 65}px;
    display: flex;
    flex-direction: column;
    height: 100%;
`
const Header = styled.div `
    padding: 20px;
    border-bottom: 1px solid ${color.border};
`
const Content = styled.div `
    flex-grow:1;
    padding: 20px;
    overflow: auto;
`
const Title = styled.h2 `
    font-size: 18px;
    font-weight: 400;
    color: ${color.body};
   
`

const CameraList = styled.div `
       display: flex;
       flex-flow: row wrap;
       justify-content: space-around;
`

const COLLECTION = 'cameras';


class Cameras extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isFetching: false,
        }
    }

    componentDidMount() {

        this.props.setActiveMenu(COLLECTION);



    }


    componentWillMount() {

    }


    render() {
        const {model, app} = this.props;
        const {sidebarIsOpen} = app;

        const cameras = model.models.camera.valueSeq();

        return (
            <Wrapper>

                <Sidebar/>

                <Main sidebarIsOpen={sidebarIsOpen}>
                    <Header>
                        <Title>Cameras</Title>
                    </Header>
                    <Content>
                        <CameraList>
                            {
                                cameras.map((camera, key) => {

                                    return (
                                        <CameraItem key={key} camera={camera}/>
                                    );
                                })
                            }
                        </CameraList>
                    </Content>
                </Main>

            </Wrapper>
        )
    }
}


const mapStateToProps = (state, props) => ({
    app: state.app,
    model: state.model,
});

const mapDispatchToProps = dispatch => bindActionCreators({
    getModels,
    getManyModels,
    requestDeleteModel,
    setModelCount,
    setActiveMenu: (name) => {
        return (dispatch) => {

            dispatch({
                type: ACTIVE_MENU,
                payload: name,
            });


        }
    },
}, dispatch);


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Cameras)