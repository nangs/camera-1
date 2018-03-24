import React, {Component} from 'react'
import Live from "./src/components/live"
import AppStore from './src/app-store'
import {AppState} from 'react-native'

const store = new AppStore();

console.log(store);

export default class App extends Component {

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
