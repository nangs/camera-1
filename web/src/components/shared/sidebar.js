import React, {Component} from 'react'
import styled from 'styled-components'
import {color, sidebar} from "../theme";
import avatar from '../../images/avatar.png'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import _ from 'lodash'
import {ACTIVE_MENU, TOGGLE_SIDEBAR} from "../../redux/reducers/app";
import Popover from './popover'
import {logout} from "../../redux/actions/app";
import {history} from "../../history";
import {config} from "../../config";

const Wrapper = styled.div `
    display: flex;
    flex-direction: row;
    background: #FFF;
    padding: 0;
    width: ${props => props.open ? sidebar.width : 70}px;
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
`
const First = styled.div `
    display: flex;
    align-items: center;
    flex-direction: column;
    padding: 10px;
`
const Second = styled.div `
    flex-grow: 1;
    padding: 10px;
`
const Toggle = styled.div `
    width: 10px;
    height: 100%;
    background: #FFF;
    display: flex;
    cursor: pointer;
    border-right: 1px solid ${color.border};
    button {
        opacity: 0;
        &:hover {
            opacity: 1;
        }
    }
    &:hover{
        background: rgba(0, 0, 0, 0.03);
    }
`
const ToggleButton = styled.button `
    border: 0 none;
    background: none;
    outline: none;
    cursor: pointer;
`
const MenuButtons = styled.div `
    display: flex;
    flex-direction: column;
   
`
const AddButton = styled.button `
    background: ${props => props.active ? 'rgba(0,0,0,0.1)' : 'none'};
    padding: 0;
    margin: 0;
    font-size: 18px;
    text-align: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 0 none;
    outline: 0 none;
    cursor: pointer;
    &:hover{
        background: rgba(0,0,0,0.1);
        outline: 0 none;
    }
    span {
        display: inline-block;
        line-height: 40px;
    }
    
`
const Avatar = styled.div `
    width: 40px;
    height: 40px;
    background: #FFF;
    border: 1px solid ${color.border};
    align-items: center;
    display: flex;
    border-radius: 50%;
    margin: 0 0 20px 0;
    background: ${color.border};
    cursor: pointer;
`
const AvatarImage = styled.img `
    width: 40px;
    height: 40px;
    border-radius: 50%;
`
const Logo = styled.h1 `
    font-size: 20px;
    font-weight: 700;
    margin: 10px 0 30px 0;
    padding: 0 8px;
`

const Menu = styled.div `

`
const MenuItem = styled.div `
    display: flex;
    padding: 5px 8px;
    margin: 0;
    font-weight: 400;
    align-items: center;
    cursor: pointer;
    background: ${props => props.active ? 'rgba(0,0,0,0.04)' : '#FFF'};
    color: ${color.bold};
    &:hover{
        background: rgba(0,0,0,0.08);
    }
    
`
const MenuIcon = styled.span `
    align-items: center;
    width: 30px;
    height: 30px;
    line-height: 30px;
`
const MenuTitle = styled.div `
    font-size: 14px;
    flex-grow: 1;
`

const PopMenu = styled.div `
    min-width: 100px;
`
const PopMenuItem = styled.div  `
    padding: 5px 8px;
    &:hover{
        background: rgba(0,0,0,0.02);
    }
    border-bottom: 1px solid ${color.border};
`


class Sidebar extends Component {
    render() {
        const {menu, activeMenu, currentUser, sidebarIsOpen} = this.props.app;

        const firstName = _.get(currentUser, 'firstName', '');
        const lastName = _.get(currentUser, 'lastName', '');
        const userId = _.get(currentUser, '_id');
        const userAvatar = _.get(currentUser, 'avatar',null);
        let avatarUrl = userAvatar ? `${config.url}/files/${userAvatar}` : null;

        return (
            <Wrapper open={sidebarIsOpen}>
                <First>
                    <Avatar>
                        <Popover
                            placement={'bottom'}
                            target={<AvatarImage src={avatarUrl ? avatarUrl : avatar}/>}
                            content={(<PopMenu>
                                <PopMenuItem onClick={() => {

                                    history.push(`/users/${userId}/edit`);

                                }}>{`${firstName} ${lastName}`}</PopMenuItem>
                                <PopMenuItem onClick={() => {
                                    this.props.logout();
                                }}>Sign Out</PopMenuItem>
                            </PopMenu>)}
                        />


                    </Avatar>
                    <AddButton onClick={() => {
                        history.push('/videos/create');
                    }}><span className={'icon-plus-1'}/></AddButton>
                    {!sidebarIsOpen && <MenuButtons>
                        {
                            menu.map((item, index) => {
                                return (
                                    <AddButton key={index} active={activeMenu === _.get(item, 'name')} onClick={() => {
                                        history.push(_.get(item, 'link'));
                                        this.props.setActiveMenu(_.get(item, 'name'));
                                    }}><span className={_.get(item, 'icon')}/></AddButton>
                                )
                            })
                        }


                    </MenuButtons> }
                </First>
                {sidebarIsOpen &&
                <Second>
                    <Logo>Tabvn Camera</Logo>
                    <Menu>
                        {
                            menu.map((item, index) => {
                                return (
                                    <MenuItem onClick={() => {

                                        history.push(_.get(item, 'link'));
                                        this.props.setActiveMenu(_.get(item, 'name'));
                                    }} key={index} active={activeMenu === _.get(item, 'name')}>
                                        <MenuIcon className={_.get(item, 'icon')}/>
                                        <MenuTitle>{_.get(item, 'title')}</MenuTitle>
                                    </MenuItem>
                                )
                            })
                        }


                    </Menu>
                </Second>
                }
                <Toggle onClick={() => {

                    this.props.toggleSidebar(!sidebarIsOpen);
                }}>
                    <ToggleButton type={'button'}>
                        <span className={`${sidebarIsOpen ? 'icon-left-open-mini' : 'icon-right-open-mini'}`}/>
                    </ToggleButton>
                </Toggle>
            </Wrapper>
        )
    }
}


const mapStateToProps = (state, props) => ({
    app: state.app,
});

const mapDispatchToProps = dispatch => bindActionCreators({
    toggleSidebar: (bool = false) => {
        return (dispatch) => {
            dispatch({
                type: TOGGLE_SIDEBAR,
                payload: bool
            })
        }
    },
    setActiveMenu: (name) => {
        return (dispatch) => {

            dispatch({
                type: ACTIVE_MENU,
                payload: name,
            });


        }
    },
    logout
}, dispatch);


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Sidebar)