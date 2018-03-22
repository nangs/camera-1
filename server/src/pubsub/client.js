import {Map} from 'immutable'
import {uuid} from "../lib/objectid";
import _ from 'lodash'

export default class ClientManager {
    constructor() {
        this._clients = new Map();
    }

    get(id) {
        return this._clients.get(id);
    }

    find(predicate = null) {
        return this._clients.filter(predicate);
    }

    set(client) {
        if (!client.id) {
            client.id = this.autoId();
        }
        this._clients = this._clients.set(client.id, client);
    }

    remove(id) {
        const client = this.get(id);
        if (client) {
            client.close();
        }
        this._clients = this._clients.remove(id);
    }

    autoId() {
        return uuid();
    }
}

export class Client {
    constructor(params) {
        this.ws = _.get(params, 'ws');
        this.id = _.get(params, 'id');
        this.userId = _.get(params, 'userId');


        this.send = this.send.bind(this);
        this.isAuthenticated = this.isAuthenticated.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.unsubscribe = this.unsubscribe.bind(this);
        this.close = this.close.bind(this);
        this.logout = this.logout.bind(this);

        this._topics = new Map();
    }

    send(message) {
        this.ws.send(JSON.stringify(message));
    }

    isAuthenticated() {
        return !!this.userId;
    }

    logout() {
        this.close();
    }

    close() {
        this.userId = null;

        this._topics.forEach((topic) => {
            topic.unsubscribe(this);
        });
        this._topics.clear();
    }

    subscribe(topic) {
        this._topics = this._topics.set(topic.id, topic);
        topic.subscribe(this);
    }

    unsubscribe(topic) {
        this._topics = this._topics.remove(topic.id);
        topic.unsubscribe(this);
    }
}