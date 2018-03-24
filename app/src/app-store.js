import ClientPubSub from "./pubsub";
import {ws} from "./config";
import {EventEmitter} from 'fbemitter'

export default class AppStore {
    constructor() {

        this._connected = false;

        this.queue = [];
        this.event = new EventEmitter();

        this.connected = this.connected.bind(this);
        this.runQueue = this.runQueue.bind(this);
        this.publish = this.publish.bind(this);
        this.broadcast = this.broadcast.bind(this);
        this.recoding = false;

        this.pubsub = new ClientPubSub({reconnect: true, url: ws});

        this.pubsub.onClose((e) => {
            console.log("Connection is closed", e);
            this._connected = false;

        });

        this.pubsub.onError((e) => {

            console.log("Connection is error", e);
            this._connected = false;
        });

        this.pubsub.connect((err) => {
            if (err) {
                console.log("An error connecting to the server", err);

                return;

            }

            this._connected = true;

            // run queue
            this.runQueue();

            if (this.recoding) {
                console.log("Start camera after reconnect");
                this.start_camera();
            }


        })
    }

    start_camera() {

        this.event.emit('start_camera', true);
        this.recoding = true;

    }

    stop_camera() {
        this.recoding = false;
        this.event.emit('start_camera', false);
    }

    connected() {

        return this._connected;
    }

    runQueue() {
        if (this.queue.length) {
            this.queue.forEach((q, index) => {
                this.executeQueue(q);
                _.unset(this.queue, index);

            });
        }
    }

    executeQueue(q) {

        switch (q.type) {

            case 'publish':

                this.publish(q.topic, q.message, q.cb);

                break;

            case 'broadcast':

                this.broadcast(q.topic, q.message, q.cb);

                break;

            case 'subscribe':

                this.subscribe(q.topic, q.cb);

                break;

            case 'send':

                this.send(q.message, q.cb);

                break;


            default:

                break;
        }
    }

    /**
     * Send message to socket server
     * @param message
     * @param cb
     */
    send(message, cb = null) {

        console.log("Send message to server", message, this._connected);
        if (this.connected()) {
            this.pubsub.send(message, cb ? cb : null)
        } else {
            // let save in queue if not connected
            this.queue.push({
                type: 'send',
                message: message,
                cb: cb ? cb : null
            })
        }
    }

    /**
     * Publish a message to topic
     * @param topic
     * @param message
     * @param cb
     */
    publish(topic, message, cb) {

        if (this.connected()) {
            this.pubsub.publish(topic, message);
        } else {
            // need keep in queue and do later when connect is retry.
            this.queue.push({
                type: 'publish',
                topic: topic,
                message: message,
                cb: cb ? cb : null
            });
        }
    }

    /**
     *  Publish a message to topic sent to everyone subscribed but not me
     * @param topic
     * @param message
     * @param cb
     */
    broadcast(topic, message, cb) {
        if (this.connected()) {
            this.pubsub.broadcast(topic, message);
        } else {
            // need keep in queue and do later when connect is retry.
            this.queue.push({
                type: 'broadcast',
                topic: topic,
                message: message,
                cb: cb ? cb : null
            });
        }
    }

    /**
     * Subscribe to the topic
     * @param topic
     * @param cb
     */
    subscribe(topic, cb) {
        if (this.connected()) {
            this.pubsub.subscribe(topic, cb ? cb : null);
        } else {
            this.queue.push({
                type: 'subscribe',
                topic: topic,
                cb: cb ? cb : null
            });
        }
    }

    clientId() {
        if (this.connected()) {
            return this.pubsub.id();
        }
        return null;

    }
}