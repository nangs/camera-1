import React from 'react'
import styled from 'styled-components'
import {Container, Content, Header, Body, Title, Form, Item, Input, Label, Button, Text} from 'native-base'
import {ActivityIndicator, Alert} from 'react-native'

const Actions = styled.View `
    padding: 20px 10px;
`

const AdditionActions = styled.View `
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
`
export default class Register extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            email: "",
            password: "",
            passwordConfirm: "",
            emailError: false,
            passwordError: false,
            passwordConfirmError: false,
            isFetching: false,
        };

        this._onSubmit = this._onSubmit.bind(this);
    }

    isEmail(email) {
        const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

        return regex.test(email);
    }

    _onSubmit() {
        const {store} = this.props;

        const {email, password, passwordConfirm} = this.state;

        const isEmailValid = this.isEmail(email);
        const isPasswordError = password === "" || !password;
        const isPasswordConfirmError = !passwordConfirm || password !== passwordConfirm;
        this.setState({
            emailError: !isEmailValid,
            passwordError: isPasswordError,
            passwordConfirmError: isPasswordConfirmError
        }, () => {

            if (isEmailValid && password !== "") {

                this.setState({
                    isFetching: true
                }, () => {

                    store.register({email: email, password: password}).then((res) => {

                        console.log("Account created", res);
                        store.login(email, password).then((res) => {
                            this.props.navigation.navigate('App');
                        }).catch((err) => {
                            const errorMessage = _.get(err, '[0].message', '');
                            Alert.alert("Login Error", errorMessage ? errorMessage : "Your account has been created,however login error!");
                        });
                    }).catch(err => {
                        console.log(err);
                        const errorMessage = _.get(err, '[0].message', '');
                        const isEmailError = errorMessage.search(/Email/);

                        this.setState({
                            emailError: !!isEmailError,
                            isFetching: false
                        }, () => {
                            Alert.alert("Sign Up Error", errorMessage ? errorMessage : "Something wrong with you!");
                        });


                    })
                })
            }
        });


    }

    render() {

        return (
            <Container>
                <Header>
                    <Body>
                    <Title>Sign Up</Title>
                    </Body>
                </Header>
                <Content>

                    <Form>
                        <Item floatingLabel error={this.state.emailError}>
                            <Label>Email</Label>
                            <Input value={this.state.email} onChangeText={(text) => this.setState({
                                email: text
                            })} autoCapitalize={'none'} keyboardType={'email-address'}/>
                        </Item>
                        <Item error={this.state.passwordError} floatingLabel>
                            <Label>Password</Label>
                            <Input value={this.state.password} onChangeText={(text) => {
                                this.setState({
                                    password: text
                                })
                            }} autoCapitalize={'none'} secureTextEntry={true}/>
                        </Item>

                        <Item error={this.state.passwordConfirmError} floatingLabel last>
                            <Label>Confirm Password</Label>
                            <Input value={this.state.passwordConfirm} onChangeText={(text) => {
                                this.setState({
                                    passwordConfirm: text
                                })
                            }} autoCapitalize={'none'} secureTextEntry={true}/>
                        </Item>
                        <Actions>
                            <Button disabled={this.state.isFetching} onPress={this._onSubmit} block>
                                <Text>Sign Up</Text>
                            </Button>
                        </Actions>

                        <AdditionActions>
                            <Text>Already have an account? </Text>
                            <Button onPress={() => {
                                this.props.navigation.goBack();
                            }} transparent><Text>Sign In</Text></Button>
                        </AdditionActions>
                    </Form>
                    <ActivityIndicator animating={this.state.isFetching} hidesWhenStopped={true}/>

                </Content>
            </Container>
        )
    }
}