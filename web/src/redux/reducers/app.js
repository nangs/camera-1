import _ from 'lodash'
import Emitter from '../../helpers/emitter'
import {SET_TOKEN, SET_USER} from "../actions/app";

export const ON_CLOSE_POPOVER = 'app/on_close_popover'
export const ERROR = 'app/error';
export const ACTIVE_MENU = 'app/active_menu'
export const TOGGLE_SIDEBAR = 'app/toggle_sidebar';
export const SET_CLIENT_ID = 'app/set_client_socket_id';
let sidebarConfig = localStorage.getItem('sidebarIsOpen');
try {
    sidebarConfig = JSON.parse(sidebarConfig);
}
catch (err) {

    console.log(err);
}
const initState = {
    currentUser: null,
    token: null,
    error: null,
    sidebarIsOpen: _.get(sidebarConfig, 'open', true),
    event: new Emitter(),
    menu: [
        {name: 'cameras', title: 'Live Cameras', icon: 'icon-video', link: '/'},
        {name: 'users', title: 'Users', icon: 'icon-users-outline', link: '/users'},
    ],
    activeMenu: 'videos',
    clientId: null,
};


export default (state = initState, action) => {

    const payload = _.get(action, 'payload', null);

    switch (action.type) {

        case SET_CLIENT_ID:
            return {
                ...state,
                clientId: payload
            };

        case TOGGLE_SIDEBAR :

            localStorage.setItem('sidebarIsOpen', JSON.stringify({open: payload}));
            return {
                ...state,
                sidebarIsOpen: payload
            };


        case ERROR:

            return {
                ...state,
                error: payload,
            };

        case ACTIVE_MENU:

            return {
                ...state,
                activeMenu: payload,
            };

        case ON_CLOSE_POPOVER:

            state.event.emit(ON_CLOSE_POPOVER, payload);

            return state;

        case SET_TOKEN:

            return {
                ...state,
                token: payload,
            };

        case SET_USER:


            return {
                ...state,
                currentUser: payload,
            };


        default:

            return state;
    }
}