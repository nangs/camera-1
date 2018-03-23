import {OrderedMap, Map} from 'immutable'
import _ from 'lodash'
import {CLEAR_MODEL, MODEL_ADDED, MODEL_DELETED, SET_MODEL_COUNT} from "../actions/model";
import moment from 'moment'

const initState = {
    models: {
        camera: new OrderedMap(),
        user: new OrderedMap(),
        role: new OrderedMap(),
    },
    count: new Map(),
};


export default (state = initState, action) => {

    const payload = _.get(action, 'payload', {modelName: null, models: []});
    let modelName = null;
    let model = null;
    let modelId = _.get(payload, 'id');

    switch (action.type) {

        case SET_MODEL_COUNT:

            let model_count = state.count;

            model_count = model_count.set(_.get(payload, 'modelName'), _.get(payload, 'count'));

            return {

                ...state,
                count: model_count,
            };

        case MODEL_DELETED:

            modelName = _.get(payload, 'modelName');

            let modelItems = state.models[modelName];
            _.each(_.get(payload, 'ids'), (id) => {
                modelItems = modelItems.remove(_.toString(id));

            });

            return {
                ...state,

                models: {
                    ...state.models,
                    [modelName]: modelItems
                }
            }

        case CLEAR_MODEL:

            let m = _.get(state, `models.${payload}`);
            if (m) {
                m = m.clear();
            }


            return {
                ...state,
                models: {
                    ...state.models,
                    [payload]: m,
                }
            }

        case MODEL_ADDED:

            modelName = _.get(payload, 'modelName');

            let insertedItems = _.get(state, `models.${modelName}`, new OrderedMap());
            const models = _.get(payload, 'models', []);


            _.each(models, (model) => {

                const id = _.toString(_.get(model, 'id', null));
                insertedItems = insertedItems.set(id, model);

            });

            insertedItems.sort((a, b) => {
                return moment(_.get(a, 'created')) < moment(_.get(b, 'created'));
            });


            return {
                ...state,
                models: {
                    ...state.models,
                    [modelName]: insertedItems
                }
            };


        default:

            return state;
    }
}