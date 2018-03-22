import {Map} from 'immutable'
import uuid from 'uuid/v4'

export default class TopicManager {
    constructor() {

        this.topics = new Map();
    }

    get(name) {
        return this.topics.get(name);
    }

    set(topic) {
        if (!topic.id) {
            topic.id = uuid();
        }

        this.topics = this.topics.set(topic.id, topic);
    }

    remove(id) {
        this.topics = this.topics.remove(id);
    }

}
