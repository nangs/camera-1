import _ from 'lodash'
import {addModels, CLEAR_MODEL, deleteModels, getModelFields, MODEL_ADDED} from "./model";
import {ERROR} from "../reducers/app";

export const SET_USER = 'app/set_user';
export const SET_TOKEN = 'app/set_token';


/**
 * Handle pubSub event
 * @param event
 * @returns {function(*, *, {service: *})}
 */
export const handlepubSubEvent = (event) => {

    return (dispatch, getState, {service}) => {

        const eventType = _.get(event, 'type');
        const payload = _.get(event, 'payload');
        let model = null;
        let modelName = null;
        let id = null;

        switch (eventType) {

            case 'pubSub_model_added':

                modelName = _.get(payload, 'modelName');
                model = _.get(payload, 'model');
                dispatch(addModels(modelName, [model]));


                break;

            case 'pubSub_model_updated':

                modelName = _.get(payload, 'modelName');
                model = _.get(payload, 'model');
                dispatch(addModels(modelName, [model]));

                break;

            case 'pubSub_model_deleted':

                modelName = _.get(payload, 'modelName');
                model = _.get(payload, 'model');
                id = _.get(payload, 'id');
                dispatch(deleteModels(modelName, [id]));

                break;


            default:

                break;
        }
    }

}

/**
 * Handle set current user token
 * @param token
 */

export const setToken = (token = null) => {

    return (dispatch, getState, {service, pubSub}) => {

        localStorage.setItem('currentToken', JSON.stringify(token));

        dispatch({
            type: SET_TOKEN,
            payload: token
        });

        service.setToken(token);
        pubSub.setToken(token);
    }

}

/**
 * Handle action set current user
 * @param user
 * @returns {function(*, *, {service: *})}
 */

export const setCurrentUser = (user = null) => {

    return (dispatch, getState, {service}) => {

        dispatch({
            type: SET_USER,
            payload: user
        });

        localStorage.setItem('currentUser', JSON.stringify(user));

        if (user) {
            // let add this user to store as well
            dispatch({
                type: MODEL_ADDED,
                payload: {
                    modelName: 'user',
                    models: [user],
                },
            });
        }


    }
}


/**
 * Login
 * @param email
 * @param password
 * @returns {function(*, *, {service: *})}
 */
export const login = (email, password) => {
    return (dispatch, getState, {service}) => {


        return new Promise((resolve, reject) => {

            const userFields = getModelFields('user');
            const tokenFields = getModelFields('token');

            const fields = Object.assign(tokenFields, {user: userFields});

            service.mutation(`login`, {email: email, password: password}, fields).then((data) => {

                const user = _.get(data, 'user');
                const token = data;

                dispatch(setCurrentUser(user));
                dispatch(setToken(token));

                console.log(user, token);
                return resolve(data);

            }).catch((err) => {
                dispatch({
                    type: ERROR,
                    payload: err,
                });
                return reject(err);
            });

        });


    }

}

/**
 * Logout
 * @returns {function(*=, *, {service: *})}
 */
export const logout = () => {
    return (dispatch, getState, {service, pubSub}) => {


        return new Promise((resolve, reject) => {


            pubSub.send({action: 'logout', payload: null});


            service.mutation(`logout`, {token: '{token}'}, {success: true}).then((data) => {

                const models = ['user', 'token'];
                _.each(models, (name) => {
                    dispatch({
                        type: CLEAR_MODEL,
                        payload: name,

                    })

                });

                dispatch(setCurrentUser(null));
                dispatch(setToken(null));


                return resolve(data);
            }).catch((err) => {
                dispatch({
                    type: ERROR,
                    payload: err,
                });
                return reject(err);
            });

        });


    }

}

