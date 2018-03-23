import Service from './helpers/service'
import thunk from 'redux-thunk';
import {createStore, applyMiddleware} from 'redux'
import reducers from './redux/reducers'
import {setCurrentUser, setToken} from "./redux/actions/app";
import ClientPubSub from "./pubsub";
import {config} from "./config";
import {addModels, deleteModels, getModelFields} from "./redux/actions/model";
import _ from 'lodash'

const service = new Service();
const pubSub = new ClientPubSub({
    reconnect: true,
    url: config.webSocketUrl
});


export const store = createStore(
    reducers,
    applyMiddleware(thunk.withExtraArgument({service, pubSub}))
);

pubSub.connect(() => {

    console.log("you are connected");


    // Subscribe camera ready channel
    pubSub.subscribe('camera_ready', (payload) => {

        const camera = {
            id: _.get(payload, 'clientId'),
            name: _.get(payload, 'name'),
            userId: _.get(payload, 'userId'),
            clientId: _.get(payload, 'clientId')
        };

        console.log('Receive camera:', payload);

        store.dispatch(addModels('camera', camera));

        // let subscribe when this camera disconnect we remove it from the store

        pubSub.subscribe(`camera_stop_${camera.id}`, () => {
            store.dispatch(deleteModels('camera', camera.id));
        });


    });


    window.ps = pubSub;

});


let token = null;
let user = null;

let userInStore = localStorage.getItem('currentUser');
let tokenInStore = localStorage.getItem('currentToken');

try {
    user = JSON.parse(userInStore);
    token = JSON.parse(tokenInStore);
}
catch (err) {
    console.log(err);
}


store.dispatch(setToken(token));
store.dispatch(setCurrentUser(user));
const userFields = getModelFields('user');

if (token) {
    service.query('me', null, userFields).then((data) => {
        store.dispatch(setCurrentUser(data));
    }).catch((err) => {

        console.log(err)

        // store.dispatch(setCurrentUser(null));
        //store.dispatch(setToken(null));
    });
}