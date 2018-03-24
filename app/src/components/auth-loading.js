import React from 'react';
import {
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import styled from 'styled-components'

const Container = styled.View`
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
`
export default class AuthLoading extends React.Component {
    constructor(props) {
        super(props);

        this._getUserToken();


    }

    async _getUserToken() {
        const {store} = this.props;
        const userToken = await store.getToken();
        this.props.navigation.navigate(userToken ? 'App' : 'Auth');
    };

    componentDidMount() {

    }

    render() {
        return (
            <Container>
                <ActivityIndicator/>
                <StatusBar barStyle="default"/>
            </Container>
        );
    }
}