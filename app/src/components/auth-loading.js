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

    /**
     * Check user if logged or not
     * @returns {Promise<void>}
     * @private
     */
    async _getUserToken() {
        const {store} = this.props;
        const userToken = await store.getToken();
        this.props.navigation.navigate(userToken ? 'App' : 'Auth');
    };

    render() {
        return (
            <Container>
                <ActivityIndicator size={'large'}/>
                <StatusBar barStyle="default"/>
            </Container>
        );
    }
}