import React from 'react'
import Live from "./src/components/live"
import AppStore from './src/app-store'
import {StackNavigator} from 'react-navigation'
import Login from "./src/components/login"
import Register from "./src/components/register"
import AuthLoading from "./src/components/auth-loading"
import Home from "./src/components/home";
import {AppState} from 'react-native'
import Profile from "./src/components/profile";

const store = new AppStore();

AppState.addEventListener('change', (state) => {
    store.event.emit('app_change', state);
});

const UserStack = StackNavigator(
    {
        Profile: {
            screen: props => <Profile {...props} {...{store: store}} />
        }
    },
    {
        navigationOptions: {
            header: null,
            gesturesEnabled: true
        },
        cardStyle: {
            backgroundColor: '#FFF'
        },

    }
)
const MainStack = StackNavigator(
    {
        Home: {
            screen: props => <Home {...props} {...{store: store}} />
        },
        Live: {
            screen: props => <Live {...props} {...{store: store}} />
        },
        User: {
            screen: UserStack
        }
    },
    {
        navigationOptions: {
            header: null,
            gesturesEnabled: false
        },
        cardStyle: {
            backgroundColor: '#FFF'
        },
        mode: 'modal',
    },
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
        },

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