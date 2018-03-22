import {Map} from 'immutable'
import {uuid} from "../lib/objectid";
import _ from 'lodash'

export default class TopicManager {
    constructor() {
        this._topics = new Map();

    }

    set(topic) {
        if (!topic.id) {
            topic.id = this.id();
        }
        const topicExist = this._topics.get(topic.id);
        if (topicExist) {
            return topicExist;
        }

        topic = new Topic(topic);
        this._topics = this._topics.set(topic.id, topic);

        return topic;
    }

    remove(id) {
        this._topics = this._topics.remove(id);
    }

    id() {
        return uuid();
    }
}

export class Topic {

    constructor(params) {

        this.id = _.get(params, 'id');

        this._queue = [];
        this._subscribers = new Map();


        this.subscribe = this.subscribe.bind(this);
        this.unsubscribe = this.unsubscribe.bind(this);
        this.publish = this.publish.bind(this);
    }

    /**
     * Subscribe new client to topic
     * @param client
     */
    subscribe(client) {

        this._subscribers = this._subscribers.set(client.id, client);
    }

    /**
     * Unsubscribe client to topics
     * @param clientId
     */
    unsubscribe(client) {

        this._subscribers = this._subscribers.remove(client.id);
    }

    /**
     * Publish message
     * @param message
     * @param clientId
     */
    publish(message, clientId = null) {
        this._queue.push(message);
        let clients = this._subscribers;

        if (clientId) {
            clientId = this._subscribers.filter((client) => client.id !== client);
        }
        clients.forEach((client, k) => {
            console.log("Sending message to subscriber", k, message);
            if (clientId) {

            } else {
                client.send({
                    action: 'topic_message',
                    payload: {
                        name: this.id,
                        message: message
                    }
                });
            }

        });
    }
}