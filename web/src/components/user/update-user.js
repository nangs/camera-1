import React, {Component} from 'react'
import styled from 'styled-components'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {
    createModel, getManyModels, getModel, getModelFields, getModels, updateMany,
    updateModel
} from "../../redux/actions/model";
import Sidebar from "../shared/sidebar";
import {color, sidebar} from "../theme";
import _ from 'lodash'
import {isEmail} from "../../helpers/validate";
import {history} from "../../history";
import {ACTIVE_MENU} from "../../redux/reducers/app";
import {setCurrentUser} from "../../redux/actions/app";
import {config} from "../../config";

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

const FormActions = styled.div `
    
`

const Form = styled.form ` 
    
`

const FormItem = styled.div `
    margin-bottom: 15px;
    display: flex;
    flex-direction: column;
    label {
        padding-right: 10px;
    }
 
`
const Label = styled.label `
    font-weight: 400;
    color: ${color.bold};
    display: block;
    margin-bottom: 5px;
`


const Input = styled.input `
    padding: 5px 10px;
    border: 1px solid ${props => props.error ? color.error : color.border };
    color:  ${props => props.error ? color.error : color.body };
    outline: 0 none;
    flex-grow: 1;
`

const Submit = styled.button `
    border: 1px solid ${color.border};
    padding: 5px 10px;
    background: #FFF;
    font-weight: 700;
    cursor: pointer;
    
`


const Button = styled.button `
    border: 1px solid ${color.border};
    padding: 5px 10px;
    background: #FFF;
    font-weight: 400;
    cursor: pointer;
    margin-left: 10px;
    
`

const Message = styled.div `
    border: 1px solid #cce5ff;
    color: #004085;
    background-color: #cce5ff;
    border-color: #b8daff;
    padding: 5px 8px;
    margin-bottom: 20px;
    &.error {
        color: #721c24;
        background-color: #f8d7da;
        border-color: #f5c6cb;
    }
    &.success {
        color: #155724;
        background-color: #d4edda;
        border-color: #c3e6cb;
    }
`

const Checkbox = styled.input `
    margin-right: 5px;
`
const CheckboxLabel = styled.label `
    
`

const Avatar = styled.div `
    width: 100px;
    height: 100px;
    position: relative;
    
`
const Img = styled.img `
   max-with: 100%;
   height: auto;
   width: 100%;
   position: relative;
   z-index: 1;
   
`
const DeleteAvatar = styled.span `
    display: block;
    z-index: 3;
    position: absolute;
    top: 50%;
    left: 0;
    color: ${color.error};
    width: 100%;
    text-align: center;
    font-size: 12px;
    cursor: pointer;
    font-weight: 700;
    
`

const fields = [
    {name: 'firstName', type: 'text', label: 'First Name', placeholder: 'First Name', required: true},
    {name: 'lastName', type: 'text', label: 'Last Name', placeholder: 'Last Name', required: true},
    {name: 'email', type: 'text', label: 'Email', placeholder: 'Email address', required: true, email: true},
    {name: 'password', type: 'password', label: 'Password', placeholder: 'Your password', required: false},
];

class UpdateUser extends Component {

    constructor(props) {
        super(props);

        this.state = {
            model: null,
            error: {},
            message: null,
            disableSubmit: false,
            userRoles: [],
            avatar: null,

        };

        this._onTextFieldChange = this._onTextFieldChange.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
        this._onAddAvatar = this._onAddAvatar.bind(this)

    }

    componentWillMount() {

        const {match} = this.props;
        const id = _.get(match, 'params.id');
        const {model} = this.props;

        this.setState({
            disableSubmit: true,
        }, () => {
            if (!model.models.role.size) {
                this.props.getModels('role', {limit: 50, skip: 0});
            }

            this.props.getModel('user', id).then((model) => {
                model = _.setWith(model, 'password', '');
                let filename = _.get(model, 'avatar', null);
                this.setState({
                    model: model,
                    disableSubmit: false,
                    avatar: filename ? {filename: filename} : null
                })
            });

        })

    }

    componentDidMount() {


        this.props.setActiveMenu('users');
    }


    _onTextFieldChange(event) {

        let {model} = this.state;

        const name = _.get(event, 'target.name');
        const value = _.get(event, 'target.value', '');

        model = _.setWith(model, name, value);

        this.setState({
            message: null,
            model: model
        }, () => {
            this.validate(name);
        });

    }

    getFields(names = []) {


        let items = [];

        if (!names || names.length === 0) {
            return fields;
        }
        _.each(names, (name) => {
            let item = fields.find((f) => f.name === name);
            if (item) {
                items.push(item);
            }
        });

        return items;
    }

    validate(fieldNames = [], cb = () => {
    }) {
        let {model, error} = this.state;

        let errors = [];

        let errorMessage = "";

        if (!Array.isArray(fieldNames) && fieldNames !== null) {
            fieldNames = [fieldNames];
        }

        let fieldItems = this.getFields(fieldNames);

        if (fieldNames.length === 0) {
            fieldItems = this.getFields(null);
        }
        _.each(fieldItems, (settings) => {

            const isRequired = _.get(settings, 'required', false);
            const emailField = _.get(settings, 'email', false);

            const name = _.get(settings, 'name');
            const label = _.get(settings, 'label', name);
            const value = _.get(model, name);

            _.unset(error, name);
            if (isRequired && !value) {
                errorMessage = `${label} is required`;
                error = _.setWith(error, name, errorMessage);
                errors.push(errorMessage);
            }

            if (emailField && !isEmail(value)) {
                errorMessage = `${label} must email address`;
                error = _.setWith(error, name, errorMessage);
                errors.push(errorMessage);
            }
        });
        this.setState({
            error: error,
        }, () => {
            return cb(errors);
        })
    }

    _onSubmit(event) {

        const {model} = this.state;
        const {app} = this.props;
        event.preventDefault();

        const currentUserId = _.get(app, 'currentUser._id');
        this.validate([], (errors) => {


            if (!errors || errors.length === 0) {
                // let do form submit

                this.setState({
                    disableSubmit: true,
                }, () => {

                    const q = [
                        {
                            name: 'update_user',
                            data: model,
                            model: 'user',
                            fields: getModelFields('user'),
                        },
                    ];

                    if (this.props.model.models.role.size) {
                        q.push({
                            name: 'updateUserRoles',
                            data: {roles: this.state.userRoles, _id: _.get(model, '_id')},
                            fields: {roles: true},
                        })
                    }
                    this.props.updateMany(q).then(() => {

                        if (currentUserId === _.get(model, '_id')) {
                            this.props.setCurrentUser(model);
                        }

                        history.push('/users');

                    }).catch((error) => {
                        this.setState({
                            disableSubmit: false,
                            message: {
                                type: 'error',
                                body: _.get(error, '[0].message', 'An error updating user')
                            }
                        })

                    });


                });


            }
        });


    }


    /**
     * Handle file upload
     * @param event
     * @private
     */
    _onAddAvatar(event) {


        let files = event.target.files;
        if (files && files.length) {
            this.props.upload(files).then((data) => {

                const file = _.get(data, '[0]');

                this.setState({
                    avatar: file,
                    model: {
                        ...this.state.model,
                        avatar: _.get(file, 'filename')
                    }
                });

            }).catch(() => {
                this.setState({
                    message: {
                        type: 'error',
                        body: 'File upload error'
                    }
                });
            });
        }

    }

    render() {
        const {app, model} = this.props;
        const {sidebarIsOpen} = app;
        const {error} = this.state;
        const roles = model.models.role.valueSeq();

        return (
            <Wrapper>

                <Sidebar/>

                <Main sidebarIsOpen={sidebarIsOpen}>
                    <Header>
                        <Title>Users/ Edit User</Title>
                    </Header>
                    <Content>
                        <Form onSubmit={this._onSubmit}>
                            {this.state.message && <Message
                                className={_.get(this.state, 'message.type', 'success')}>{_.get(this.state, 'message.body', '')}</Message>}

                            {fields.map((field, index) => {
                                return (
                                    <FormItem key={index}>
                                        <Label>{_.get(field, 'label')}</Label>
                                        <Input error={_.get(error, field.name)} onChange={this._onTextFieldChange}
                                               type={_.get(field, 'type')}
                                               name={_.get(field, 'name')}
                                               placeholder={_.get(field, 'placeholder')}
                                               value={_.get(this.state, `model.${field.name}`, '')}/>
                                    </FormItem>
                                )

                            })}

                            <FormActions>
                                <Submit
                                    disabled={this.state.disableSubmit}
                                    type={'submit'}>{this.state.disableSubmit ? 'Please wait...' : 'Update'}</Submit>

                                <Button
                                    onClick={() => {
                                        history.push('/users');

                                    }}
                                    type={'button'}>{`Cancel`}</Button>
                            </FormActions>
                        </Form>
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
    createModel,
    getManyModels,
    getModel,
    updateModel,
    setCurrentUser,
    updateMany,
    deleteFile: (file) => {
        return (dispatch, getState, {service}) => {

            return service.mutation('deleteFile', {filename: _.get(file, 'filename')}, {deleted: true});
        }
    },
    upload: (files) => {
        return (dispatch, getState, {service}) => {

            return service.upload(files);
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


}, dispatch);


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(UpdateUser)