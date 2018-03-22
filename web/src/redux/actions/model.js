import _ from 'lodash'
import {ERROR} from "../reducers/app";

export const MODEL_DELETED = 'model/delete';
export const MODEL_ADDED = 'model/add';
export const CLEAR_MODEL = 'model/clear';
export const SET_MODEL_COUNT = 'model/set_model_count'
/**
 * Get model fields
 * @param name
 */
export const getModelFields = (name) => {
    const fields = {
        user: {
            id: {},
            firstName: {},
            lastName: {},
            email: {},
            password: {},
            created: {},
            updated: {},
        },
        role: {
            id: {},
            name: {},
            created: {},
        },
        token: {
            id: {},
            token: {},
            userId: {},
            created: {},
        },
    };

    let field = {};
    _.each(_.get(fields, name), (value, key) => {
        field[key] = true;
    });

    return field;
}

/**
 * Set Model count
 * @param name
 * @param count
 * @returns {function(*, *, {service: *})}
 */

export const setModelCount = (name, count) => {

    return (dispatch, getState, {service}) => {

        dispatch({
            type: SET_MODEL_COUNT,
            payload: {
                modelName: name,
                count: count,
            }
        })
    }
}

/**
 * Delete models
 * @param modelName
 * @param ids
 * @returns {function(*, *, {service: *})}
 */
export const deleteModels = (modelName, ids = []) => {

    return (dispatch, getState, {service}) => {

        if (!Array.isArray(ids)) {
            ids = [ids];
        }
        return dispatch({
            type: MODEL_DELETED,
            payload: {
                modelName: modelName,
                ids: ids,
            }
        });
    }


};


/**
 * Get models
 * @param modelName
 * @param filter
 * @returns {function(*=, *, {service: *})}
 */
export const getModels = (modelName, filter) => {

    return (dispatch, getState, {service}) => {

        return new Promise((resolve, reject) => {


            const modelFields = getModelFields(modelName);
            const limit = _.get(filter, 'limit', 50);
            const skip = _.get(filter, 'skip', 0);
            service.query(`${modelName}s`, {limit: limit, skip: skip}, modelFields).then((data) => {

                dispatch(addModels(modelName, data));

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
 * Get many models
 * @param queries
 * @returns {function(*=, *, {service: *})}
 */
export const getManyModels = (queries) => {

    return (dispatch, getState, {service}) => {

        return new Promise((resolve, reject) => {

            const modelNames = [];

            _.each(queries, (query) => {
                const name = _.get(query, 'model');
                if (name) {
                    modelNames.push(name);
                }
            });

            service.queryMany(queries).then(data => {

                _.each(modelNames, (name) => {
                    let modelData = _.get(data, `${name}s`);
                    if (typeof modelData !== 'undefined') {
                        dispatch(addModels(name, modelData));
                    }
                });

                return resolve(data);

            }).catch((err) => {

                dispatch({
                    type: ERROR,
                    payload: err
                });

                return reject(err);
            });
        })


    }
}

/**
 * Create model
 * @param modelName
 * @param model
 * @returns {function(*=, *, {service: *})}
 */
export const createModel = (modelName, model) => {

    return (dispatch, getState, {service}) => {

        return new Promise((resolve, reject) => {


            const modelFields = getModelFields(modelName);
            service.mutation(`create_${modelName}`, model, modelFields).then((data) => {

                dispatch(addModels(modelName, [data]));
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
};


/**
 * Delete model
 * @param modelName
 * @param id
 * @returns {function(*=, *, {service: *})}
 */
export const requestDeleteModel = (modelName, id) => {

    return (dispatch, getState, {service}) => {

        return new Promise((resolve, reject) => {

            service.mutation(`delete_${modelName}`, {id: id}, null).then((data) => {
                dispatch(deleteModels(modelName, [id]));
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
};


/**
 *
 * @param modelName
 * @param model
 * @returns {function(*=, *, {service: *})}
 */
export const updateModel = (modelName, model) => {

    return (dispatch, getState, {service}) => {

        return new Promise((resolve, reject) => {


            const modelFields = getModelFields(modelName);
            service.mutation(`update_${modelName}`, model, modelFields).then((data) => {

                dispatch(addModels(modelName, [data]));
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
};

/**
 * Update many
 * @param queries
 * @returns {function(*, *, {service: *})}
 */
export const updateMany = (queries) => {
    return (dispatch, getState, {service}) => {

        return new Promise((resolve, reject) => {

            const modelNames = [];

            _.each(queries, (query) => {
                const name = _.get(query, 'model');
                if (name) {
                    modelNames.push(name);
                }
            });

            service.mutationMany(queries).then(data => {

                _.each(modelNames, (name) => {
                    let modelData = _.get(data, `update_${name}`);
                    if (typeof modelData !== 'undefined') {
                        dispatch(addModels(name, modelData));
                    }
                });

                return resolve(data);

            }).catch((err) => {

                dispatch({
                    type: ERROR,
                    payload: err
                });

                return reject(err);
            });
        })

    }
}


/**
 * Get model
 * @param api
 * @param modelName
 * @param id
 * @param cache
 * @returns {function(*, *, {service: *})}
 */
export const getModel = (modelName, id, cache = true) => {

    return (dispatch, getState, {service}) => {

        return new Promise((resolve, reject) => {

            if (cache) {
                const state = getState();
                const {model} = state;

                const modelStore = _.get(model, `models.${modelName}`, null);

                if (modelStore) {
                    const modelData = modelStore.get(id);
                    if (modelData) {
                        return resolve(modelData);
                    }
                }
            }

            const modelFields = getModelFields(modelName);
            service.query(modelName, {_id: id}, modelFields).then((data) => {
                // save model to store
                dispatch(addModels(modelName, [data]));
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
 * Add models
 * @param modelName
 * @param models array or single model
 * @returns {function(*, *, {service: *})}
 */
export const addModels = (modelName, models = []) => {

    return (dispatch, getState, {service}) => {

        if (!Array.isArray(models)) {
            models = [models];
        }
        dispatch({
            type: MODEL_ADDED,
            payload: {
                modelName: modelName,
                models: models,
            },
        });
    }
}