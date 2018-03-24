import React, {Component} from 'react'
import Live from "./src/components/live"
import AppStore from './src/app-store'
import {StackNavigator} from 'react-navigation'
import Login from "./src/components/login"
import Register from "./src/components/register"
import AuthLoading from "./src/components/auth-loading"
import Home from "./src/components/home";
import {AppState} from 'react-native'
import Amplify, {Storage} from 'aws-amplify';
import aws_exports from './aws-exports';

Amplify.configure(aws_exports);

const store = new AppStore();


AppState.addEventListener('change', (state) => {
    store.event.emit('app_change', state);
});


const MainStack = StackNavigator(
    {
        Home: {
            screen: props => <Home {...props} {...{store: store}} />
        },
        Live: {
            screen: props => <Live {...props} {...{store: store}} />
        }
    },
    {
        navigationOptions: {
            header: null,
            gesturesEnabled: false
        },
    }
);

const AuthStack = StackNavigator(
    {
        SignIn: {
            screen: props => <Login {...props} {...{store: store}} />,
        },
        SignUp: {
            screen: props => <Register {...props} {...{store: store}} />
        }
    },
    {
        navigationOptions: {
            header: null,
        },
        cardStyle: {
            backgroundColor: '#FFF'
        }
    }
);

export default StackNavigator(
    {
        AuthLoading: {
            screen: props => <AuthLoading {...props} {...{store: store}} />,
        },
        App: {
            screen: MainStack,
        },
        Auth: {
            screen: AuthStack
        }
    },
    {
        initialRouteName: 'AuthLoading',
        mode: 'card',
        navigationOptions: {
            header: null,
            gesturesEnabled: false
        },
        cardStyle: {
            backgroundColor: '#FFF'
        }
    }
);