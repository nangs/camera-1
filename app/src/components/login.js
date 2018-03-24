import React from 'react'
import styled from 'styled-components'
import {Container, Content, Header, Body, Title, Form, Item, Input, Label, Button, Text} from 'native-base'

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
            passwordError: null
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
            passwordError: password !== ""
        }, () => {

            if (isEmailValid && password !== "") {

                const fields = {
                    id: {},
                    userId: {},
                    created: {},
                    user: {
                        id: {},
                        firstName: {},
                        lastName: {},
                        email: {},
                        created: {},
                    }

                };

                store.service.mutation('login', {email: email, password: password}, fields).then((res) => {

                    console.log(res);

                }).catch((err) => {
                    console.log("An error", err);
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
                        <Item floatingLabel error={true}>
                            <Label>Email</Label>
                            <Input value={this.state.email} onChangeText={(text) => this.setState({
                                email: text
                            })} autoCapitalize={'none'} keyboardType={'email-address'}/>
                        </Item>
                        <Item floatingLabel last>
                            <Label>Password</Label>
                            <Input value={this.state.password} onChangeText={(text) => {
                                this.setState({
                                    password: text
                                })
                            }} autoCapitalize={'none'} secureTextEntry={true}/>
                        </Item>

                        <Actions>
                            <Button onPress={this._onSubmit} block>
                                <Text>Sign In</Text>
                            </Button>
                        </Actions>

                        <AdditionActions>
                            <Text>Don't have account? </Text>
                            <Button transparent><Text>Sign Up</Text></Button>
                        </AdditionActions>


                    </Form>


                </Content>
            </Container>
        )
    }
}