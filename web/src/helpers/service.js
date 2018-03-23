import axios from 'axios'
import {config} from "../config";
import _ from 'lodash'


export default class Service {

    constructor() {

        let instance = axios.create({
            baseURL: config.api
        });

        instance.defaults.headers.post['Content-Type'] = 'application/json';

        this.instance = instance;
        this.token = null;


        let uploadInstance = axios.create({
            baseURL: '',
        });

        uploadInstance.defaults.headers.common = {};

        this.uploadInstance = uploadInstance;
    }

    /**
     * Get current logged user.
     * @returns {string}
     */
    currentUserId() {
        return _.toString(_.get(this.token, 'userId', null));
    }

    /**
     * Get token id
     * @returns {string}
     */
    tokenId() {
        return _.get(this.token, 'id', null);
    }

    /**
     * Replace path with token
     * @param path
     */
    path(path) {

        return _.replace(path, new RegExp("{me}", 'g'), this.currentUserId())
    }

    /**
     * Set token in header
     * @param token
     */
    setToken(token = null) {
        this.token = token;


        //this.instance.defaults.headers.common['Authorization'] = _.get(token, '_id');
    }

    /**
     * Get request
     * @param path
     * @param options
     * @returns {AxiosPromise<any>}
     */
    get(path, options = {}) {
        path = this.path(path);

        let defaultOptions = {
            headers: {
                'Authorization': _.get(this.token, 'id'),
            }
        };
        options = Object.assign(options, defaultOptions);

        return this.instance.get(path, options);
    }

    /**
     * Post request
     * @param path
     * @param data
     * @param options
     * @returns {AxiosPromise<any>}
     */
    post(path, data, options = {}) {
        path = this.path(path);

        let defaultOptions = {
            headers: {
                'Authorization': _.get(this.token, 'token'),
            }
        };

        options = Object.assign(options, defaultOptions);


        return this.instance.post(path, data, options);
    }

    /**
     * Put request
     * @param path
     * @param data
     * @param options
     * @returns {AxiosPromise<any>}
     */
    put(path, data, options = null) {
        path = this.path(path);
        return this.instance.put(path, data, options);
    }

    /**
     * Delete request
     * @param path
     * @param options
     * @returns {AxiosPromise}
     */
    delete(path, options) {
        path = this.path(path);
        return this.instance.delete(path, options);
    }

    /**
     * Get fields params for return results.
     * @param fields
     * @param subField
     * @returns {string}
     */
    getFields(fields = {}, subField = null) {

        let str = '';
        _.each(fields, (field, fieldName) => {

            if (typeof field === 'object') {
                const subStr = this.getFields(field, fieldName);
                str = `${str} ${subStr}`;
            } else {
                str = `${str} ${fieldName}`
            }
        });

        return subField ? `${subField}{ ${str} }` : `${str}`


    }

    /**
     * Get arguments params
     * @param params
     * @returns {string}
     */
    getArgs(params) {


        let queryArgs = [];
        _.each(params, (value, field) => {


            if (value === '{me}' || value === '{token}') {
                value = _.replace(value, new RegExp("{me}", 'g'), this.currentUserId());
                value = _.replace(value, new RegExp("{token}", 'g'), this.tokenId());
            }


            if (_.isString(params[field])) {
                value = `"${value}"`
            }
            if (Array.isArray(value)) {
                value = JSON.stringify(value);
            }
            queryArgs.push(`${field}:` + value);
        });


        return queryArgs && queryArgs.length ? `(${_.join(queryArgs, ', ')})` : '';

    }

    /**
     * Query
     * @param name
     * @param params
     * @param fields
     */
    query(name, params, fields) {


        const args = this.getArgs(params);
        const fieldArgs = this.getFields(fields);

        const fieldsStr = fields ? `{ ${fieldArgs} }` : ``;

        let query = `
                query { ${name}${args}${fieldsStr} }
            `


        return new Promise((resolve, reject) => {

            this.post('', {query: query, variables: null}).then((res) => {


                const errors = _.get(res, 'data.errors');
                if (errors) {
                    return reject(errors);
                }
                // remember need two data.data
                return resolve(_.get(res, `data.data.${name}`));

            }).catch((err) => {
                return reject(err);
            });

        });


    }

    /**
     *
     * @param queries
     */
    queryMany(queries = []) {

        let str = '';

        _.each(queries, (query) => {

            const params = _.get(query, 'params');
            const fields = _.get(query, 'fields');
            const args = this.getArgs(params);
            const fieldArgs = this.getFields(fields);
            const name = _.get(query, 'name');
            const fieldsStr = fields ? `{ ${fieldArgs} }` : ``;
            const q = `${name}${args}${fieldsStr}`;
            str = `${str} ${q}`

        });

        let queryStr = `query { ${str} }`;

        return new Promise((resolve, reject) => {

            this.post('', {query: queryStr, variables: null}).then((res) => {

                const errors = _.get(res, 'data.errors');
                if (errors) {
                    return reject(errors);
                }
                // remember need two data.data
                return resolve(_.get(res, `data.data`));

            }).catch((err) => {
                return reject(err);
            });

        });


    }

    /**
     * Mutation
     * @param name
     * @param data
     * @param fields
     * @returns {Promise<any>}
     */
    mutation(name, data, fields) {

        const args = this.getArgs(data);


        const fieldArgs = this.getFields(fields);


        let query = `
                mutation { ${name}${args}{ ${fieldArgs} } }
            `


        if(!fields){
            query = `
                mutation { ${name}${args} }
            `
        }
        return new Promise((resolve, reject) => {

            this.post('', {query: query, variables: null}).then((res) => {

                const errors = _.get(res, 'data.errors');
                if (errors) {
                    return reject(errors);
                }
                // remember need two data.data
                return resolve(_.get(res, `data.data.${name}`));

            }).catch((err) => {
                return reject(err);
            });

        });
    }

    /**
     * Mutation Many
     * @param queries
     * @returns {Promise<any>}
     */
    mutationMany(queries = []) {

        let str = '';

        _.each(queries, (query) => {

            const params = _.get(query, 'data');
            const fields = _.get(query, 'fields');
            const args = this.getArgs(params);
            const fieldArgs = this.getFields(fields);
            const name = _.get(query, 'name');
            const fieldsStr = fields ? `{ ${fieldArgs} }` : ``;
            const q = `${name}${args}${fieldsStr}`;
            str = `${str} ${q}`

        });

        let queryStr = `mutation { ${str} }`;

        return new Promise((resolve, reject) => {


            this.post('', {query: queryStr, variables: null}).then((res) => {

                const errors = _.get(res, 'data.errors');
                if (errors) {
                    return reject(errors);
                }
                // remember need two data.data
                return resolve(_.get(res, `data.data`));

            }).catch((err) => {
                return reject(err);
            });

        });


    }

    upload(files) {

        return new Promise((resolve, reject) => {

            let data = new FormData();
            _.each(files, (file) => {
                data.append('files', file);
            });
            this.post('/upload', data).then((res) => {

                return resolve(res.data);
            }).catch((err) => {
                return reject(err);
            })


        });

    }

    /**
     * Upload file to amazon s3
     * @param url
     * @param file
     * @returns {AxiosPromise<any>}
     */
    s3Upload(url, file, cb = () => {
    }) {

        const options = {
            headers: {
                'Content-Type': file.type,
            }
        };

        axios({
            url: url,
            method: 'put',
            headers: options.headers,
            onUploadProgress: (event) => {

                return cb({
                    event: 'onUploadProgress',
                    payload: event,
                });
            },
            data: file,
        }).then(() => {

            return cb({
                event: 'success',
                payload: null,
            })
        }).catch((err) => {
            return cb({
                event: 'error',
                payload: err,
            })
        });
    }

}