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