import React, {Component} from 'react';
import Live from "./src/components/live";
import AppStore from './src/app-store'

const store = new AppStore();

export default class App extends Component {

    render() {
        return (
            <Live store={store}/>
        );
    }
}
