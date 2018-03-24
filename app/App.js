import React, {Component} from 'react'
import Live from "./src/components/live"
import AppStore from './src/app-store'
import {AppState} from 'react-native'
import {StackNavigator} from 'react-navigation'
import Login from "./src/components/login"
import Register from "./src/components/register"
import AuthLoading from "./src/components/auth-loading"

const store = new AppStore();

class App extends Component {

    componentDidMount() {
        AppState.addEventListener('change', (state) => {
            store.event.emit('app_change', state);

        });
    }

    render() {
        return (
            <Live store={store}/>
        );
    }
}

const MainStack = StackNavigator(
    {
        Home: {
            screen: App
        }
    }
);

const AuthStack = StackNavigator(
    {
        Home: {
            screen: props => <Login {...props} {...{store: store}} />,
        },
        Register: {
            screen: Register
        }
    },
    {
        navigationOptions: {
            header: null
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
        mode: 'modal',
        navigationOptions: {
            header: null
        },
        cardStyle: {
            backgroundColor: '#FFF'
        }
    }
);