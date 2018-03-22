import React, {Component} from 'react'
import styled from 'styled-components'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {color} from "../theme";
import _ from 'lodash'
import {history} from "../../history";
import {login} from "../../redux/actions/app";
import {isEmail} from "../../helpers/validate";

const Wrapper = styled.div `
    height: 100%;
`

const Main = styled.div `
    padding: 50px 0;
    display: flex;
    flex-direction: column;
    height: 100%;
`
const FormActions = styled.div `
    
`

const Form = styled.form ` 
    padding: 20px;
    border: 1px solid ${color.border};
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
    width: 100%;
    font-weight: 700;
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

const Content = styled.div `
    width: 300px;
    height: 250px;
    margin: 0 auto;
`
const H1 = styled.h1 `
    font-size: 20px;
    font-weight: 700;
    margin: 20px 0;
    text-align: center;
`
const fields = [
    {name: 'email', type: 'text', label: 'Email', placeholder: 'Email address', required: true, email: true},
    {name: 'password', type: 'password', label: 'Password', placeholder: 'Your password', required: true},
];


class UserLogin extends Component {

    constructor(props) {
        super(props);

        this.state = {
            model: {
                email: '',
                password: ''
            },
            error: {},
            disableSubmit: false,

        };

        this._onTextFieldChange = this._onTextFieldChange.bind(this)
        this._onSubmit = this._onSubmit.bind(this);

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

        event.preventDefault();

        this.validate([], (errors) => {


            if (!errors || errors.length === 0) {
                // let do form submit

                const email = _.get(model, 'email');
                const password = _.get(model, 'password');
                this.setState({
                    disableSubmit: true,
                }, () => {

                    this.props.login(email, password).then(() => {
                        history.push('/');
                    }).catch((error) => {
                        this.setState({
                            disableSubmit: false,
                            message: {
                                type: 'error',
                                body: _.get(error, '[0].message', 'Login error')
                            }
                        })
                    });

                });


            }
        });


    }

    render() {
        const {app} = this.props;
        const {error} = this.state;
        const {sidebarIsOpen} = app;


        return (
            <Wrapper>


                <Main sidebarIsOpen={sidebarIsOpen}>

                    <Content>
                        <H1>Tabvn Camera</H1>
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

                                <Submit disabled={this.state.disableSubmit}
                                        type={'submit'}>{this.state.disableSubmit ? 'Please wait...' : 'Login'}</Submit>
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
    login
}, dispatch);


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(UserLogin)