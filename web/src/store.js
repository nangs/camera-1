import Service from './helpers/service'
import thunk from 'redux-thunk';
import {createStore, applyMiddleware} from 'redux'
import reducers from './redux/reducers'
import {setCurrentUser, setToken} from "./redux/actions/app";
import ClientPubSub from "./pubsub";
import {config} from "./config";
import {addModels, CLEAR_MODEL, deleteModels, getModelFields} from "./redux/actions/model";
import _ from 'lodash'
import {SET_CLIENT_ID} from "./redux/reducers/app";

const service = new Service();
const pubSub = new ClientPubSub({
    reconnect: true,
    url: config.webSocketUrl
});


export const store = createStore(
    reducers,
    applyMiddleware(thunk.withExtraArgument({service, pubSub}))
);

pubSub.onClose((err) => {
    store.dispatch({
        type: CLEAR_MODEL,
        payload: 'camera'
    });
});
pubSub.onError((err) => {
    store.dispatch({
        type: CLEAR_MODEL,
        payload: 'camera'
    });
})

pubSub.connect((err, id) => {

    console.log("you are connected", id);

    if (err) {
        return;
    }

    store.dispatch({
        type: SET_CLIENT_ID,
        payload: id,
    });
    // list all camera

    pubSub.send({
        action: 'camera_list',
        payload: null,
    }, (list) => {

        _.each(list, (camera) => {

            pubSub.subscribe(`camera_stop_${camera.id}`, () => {
                store.dispatch(deleteModels('camera', camera.id));
            });
        });

        store.dispatch(addModels('camera', list));
    });


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