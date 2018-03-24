import React from 'react'
import styled from 'styled-components'
import {Container, Content, Header, Body, Title, Form, Item, Input, Label, Button, Text} from 'native-base'
import {ActivityIndicator} from 'react-native'

const Actions = styled.View `
    padding: 20px 10px;
`

const AdditionActions = styled.View `
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
`
export default class Login extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            email: "",
            password: "",
            emailError: null,
            passwordError: null,
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

        const {email, password} = this.state;

        const isEmailValid = this.isEmail(email);
        this.setState({
            emailError: !isEmailValid,
            passwordError: password === "" || !password
        }, () => {

            if (isEmailValid && password !== "") {

                this.setState({
                    isFetching: true
                }, () => {

                    store.login(email, password).then(() => {
                        this.setState({
                            isFetching: false
                        }, () => {
                            this.props.navigation.navigate('App');
                        });

                    }).catch((err) => {

                        const errorMessage = _.get(err, '[0].message', '');
                        const isEmailError = errorMessage.search(/Email/);
                        const isPasswordError = errorMessage.search(/Password/);
                        this.setState({
                            passwordError: !!isEmailError || !errorMessage,
                            emailError: !!isPasswordError || !errorMessage,
                            isFetching: false
                        });
                    });

                })
            }
        });


    }

    render() {

        return (
            <Container>
                <Header>
                    <Body>
                    <Title>Please Sign In</Title>
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
                        <Item error={this.state.passwordError} floatingLabel last>
                            <Label>Password</Label>
                            <Input value={this.state.password} onChangeText={(text) => {
                                this.setState({
                                    password: text
                                })
                            }} autoCapitalize={'none'} secureTextEntry={true}/>
                        </Item>

                        <Actions>
                            <Button disabled={this.state.isFetching} onPress={this._onSubmit} block>
                                <Text>Sign In</Text>
                            </Button>
                        </Actions>

                        <AdditionActions>
                            <Text>Don't have account? </Text>
                            <Button onPress={() => {
                                this.props.navigation.navigate('SignUp');
                            }} transparent><Text>Sign Up</Text></Button>
                        </AdditionActions>
                    </Form>
                    <ActivityIndicator animating={this.state.isFetching} hidesWhenStopped={true}/>

                </Content>
            </Container>
        )
    }
}