import React, {Component} from 'react'
import styled from 'styled-components'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {getModels, requestDeleteModel, getManyModels, getModelFields, setModelCount} from "../../redux/actions/model";
import Sidebar from "../shared/sidebar";
import {color, sidebar, Spinner, More} from "../theme";
import _ from 'lodash'
import Popover from '../shared/popover'
import moment from 'moment'
import {ACTIVE_MENU} from "../../redux/reducers/app";
import {history} from "../../history";
import {Table, Tbody, Thead, Td, Tr, Th} from '../theme/table'
import {config} from "../../config";
import avatar from '../../images/avatar.png'

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


const MenuWrapper = styled.div `
    width: 100px;
`
const Menu = styled.div `
    width: 100px; 
  `
const MenuTitle = styled.button `
    border: 1px solid ${color.border};
    padding: 5px 10px;
    background: none;
    outline: 0 none;
    font-weight: 700;
    cursor: pointer;
    width: 100px;
    
    
`
const MenuItem = styled.div `
    padding: 3px 8px;
    border-bottom: 1px solid ${color.border};
    font-size: 12px;
    cursor: pointer;
    &:hover {
        background: rgba(0,0,0,0.05);
    }
`

const AddButton = styled.button `
    background: none;
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
    width: 30px;
    height: 30px;
    border: 1px solid ${color.border};
    align-items: center;
    display: flex;
    border-radius: 50%;
    margin: 0 0 20px 0;
    background: ${color.border};
    cursor: pointer;
`
const AvatarImage = styled.img `
    width: 30px;
    height: 30px;
    border-radius: 50%;
`
const LIMIT = 20;

class Users extends Component {

    constructor(props) {
        super(props);

        this.state = {
            preview: false,
            fetching: false,
        };

        this._fetch = this._fetch.bind(this);
        this._loadMore = this._loadMore.bind(this);


    }

    componentDidMount() {

        this.props.setActiveMenu('users');
    }


    componentWillMount() {

        this._fetch();
    }

    /**
     * Fetch data
     * @private
     */
    _fetch() {

        const {model} = this.props;
        const models = model.models.user;

        if (!models || models.size < 2 || model.models.role.size === 0) {
            const queries = [
                {
                    name: 'users',
                    model: 'user',
                    params: {limit: LIMIT, skip: 0},
                    fields: getModelFields('user'),
                },
                {
                    name: 'count_user',
                    fields: {count: true},
                },
                {
                    name: 'roles',
                    model: 'role',
                    params: {limit: 50, skip: 0},
                    fields: getModelFields('role'),
                }
            ];


            this.setState({
                fetching: true,
            }, () => {

                this.props.getManyModels(queries).then((data) => {

                    const modelCount = _.get(data, 'count_user.count', 0);
                    this.props.setModelCount('user', modelCount);

                    this.setState({
                        fetching: false
                    })
                }).catch(err => {
                    this.setState({
                        fetching: false,
                    })
                });
            })

        }
    }

    _loadMore() {
        const {model} = this.props;

        const models = model.models.user;

        const count = model.count.get('user');

        if (count && count > models.size) {
            this.setState({
                fetching: true,
            }, () => {
                this.props.getModels('user', {limit: LIMIT, skip: models.size}).then(() => {
                    this.setState({
                        fetching: false
                    })
                }).catch(() => {
                    this.setState({
                        fetching: false
                    })
                });
            });


        }

    }

    render() {

        const {model, app} = this.props;
        const {sidebarIsOpen} = app;
        const models = model.models.user.valueSeq();
        const count = model.count.get('user');

        return (
            <Wrapper>

                <Sidebar/>

                <Main sidebarIsOpen={sidebarIsOpen}>
                    <Header>
                        <Title>Users</Title>
                    </Header>
                    <Content>
                        <AddButton onClick={() => {
                            history.push('/users/create');
                        }}><span className={'icon-plus-1'}/></AddButton>

                        <Table>
                            <Thead>
                            <Tr>
                                <Th style={{width: 70}}/>
                                <Th>Email</Th>
                                <Th>Name</Th>
                                <Th>Created</Th>
                                <Th>Action</Th>
                            </Tr>
                            </Thead>
                            <Tbody>
                            {
                                models.map((m, index) => {

                                    const id = _.get(m, 'id');
                                    const firstName = _.get(m, 'firstName', '');
                                    const lastName = _.get(m, 'lastName', '');
                                    const userAvatar = _.get(m, 'avatar', null);
                                    let avatarUrl = userAvatar ? `${config.url}/files/${userAvatar}` : null;
                                    return (
                                        <Tr key={index}>
                                            <Td>
                                                <Avatar>
                                                    <AvatarImage src={avatarUrl ? avatarUrl : avatar}/>
                                                </Avatar>
                                            </Td>
                                            <Td>
                                                {_.get(m, 'email')}
                                            </Td>
                                            <Td>{`${firstName} ${lastName}`}</Td>
                                            <Td>{moment(_.get(m, 'created')).format('LLL')}</Td>
                                            <Td>
                                                <MenuWrapper>
                                                    <Popover
                                                        showOnHover={true} placement={'bottom'}
                                                        target={<MenuTitle>Actions</MenuTitle>}
                                                        content={
                                                            (<Menu>
                                                                <MenuItem onClick={() => {
                                                                    history.push(`/users/${id}/edit`);
                                                                }}>Edit</MenuItem>
                                                                <MenuItem onClick={() => {
                                                                    this.props.requestDeleteModel('user', id);
                                                                }}>Delete</MenuItem>
                                                            </Menu>)
                                                        }/>
                                                </MenuWrapper>

                                            </Td>
                                        </Tr>
                                    )
                                })
                            }

                            </Tbody>
                        </Table>
                        {this.state.fetching && (
                            <Spinner>
                                <div/>
                            </Spinner>
                        )}
                        {count > models.size && <More>
                            <button type={'button'} onClick={() => {

                                this._loadMore();

                            }}>Load more...
                            </button>
                        </More>}
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
)(Users)