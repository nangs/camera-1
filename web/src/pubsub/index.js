import _ from 'lodash';
import uuid from 'uuid/v4';
import {EventEmitter} from 'fbemitter'


export default class ClientPubSub {
    constructor(options) {
        this._reconnect = _.get(options, 'reconnect', true);
        this._connected = false;
        this._ws = null;
        this._url = _.get(options, 'url');
        this._token = null;
        this._id = null;

        this._connect_callback = null;
        this._error_callback = null;
        this._close_callback = null;
        this._onMessageReceived = {};


        this._event = new EventEmitter();


        this.connect = this.connect.bind(this);
        this.send = this.send.bind(this);
        this.onMessageSent = this.onMessageSent.bind(this);
        this.onError = this.onError.bind(this);
        this.onClose = this.onClose.bind(this);


    }

    id() {
        return this._id;
    }

    setToken(token) {
        this._token = token;
    }

    /**
     * Begin connect to the server via Socket
     * @param cb
     */
    connect(cb = () => {
    }) {

        this._connect_callback = cb;
        const ws = new WebSocket(this._url);
        this._ws = ws;

        ws.onopen = () => {

            console.log("Connected");


            this._connected = true;
            this.send({
                id: uuid(),
                action: 'me',
                payload: "me"
            }, (me) => {

                this._id = me;
                if (this._connect_callback) {
                    this._connect_callback(null, me);
                }
            });


        };
        ws.onmessage = (response) => {

            let message = _.get(response, 'data');
            if (typeof message === 'string') {

                message = this.toJSON(message);

                console.log("Server Message", message);


                const action = _.get(message, 'action');
                const payload = _.get(message, 'payload');

                const replyId = _.get(message, 'replyId');
                if (replyId) {
                    const cb = _.get(this._onMessageReceived, replyId);
                    if (cb) {
                        cb(payload);
                        _.unset(this._onMessageReceived, replyId);
                    }
                }

                switch (action) {
                    case 'topic_message':

                        this._event.emit(`__topic__${_.get(payload, 'name')}__message`, _.get(payload, 'message'));

                        break;


                    default:

                        break;
                }

            } else {
                console.log("Receive data message", message);
            }


        }

        ws.onclose = (e) => {

            this._event.removeAllListeners();
            console.log("Connection is close", e);
            this._connected = false;
            if (this._close_callback) {
                this._close_callback(e);
            }
            // let do reconnect
            if (this._reconnect) {
                this.connect(this._connect_callback);
            }
        };

        ws.onerror = (e) => {
            console.log("Connection is error", e);
            this._event.removeAllListeners();
            this._connected = false;
            if (this._error_callback) {
                this._error_callback(e);
            }
        };
    }

    /**
     * Event on Error
     * @param cb
     */
    onError(cb) {
        this._error_callback = cb;
    }

    /**
     * Event on close
     * @param cb
     */
    onClose(cb) {
        this._close_callback = cb;
    }

    /**
     * Send message to server
     * @param message
     * @param cb
     */
    send(message, cb) {
        if (this._ws && this._ws.readyState === 1) {
            if (!message.id) {
                message = _.setWith(message, 'id', uuid());
            }
            this._ws.send(JSON.stringify(message));
            this.onMessageSent(message.id, cb ? cb : null);

        }
    }

    /**
     * Listen when message is sent and confirmed by server
     * @param id
     * @param cb
     */
    onMessageSent(id, cb) {

        this._onMessageReceived = _.setWith(this._onMessageReceived, id, cb);
    }

    /**
     * Message to JSON
     * @param message
     * @returns {*}
     */
    toJSON(message) {
        try {
            message = JSON.parse(message);
        } catch (err) {
            console.log(err);
        }
        return message;
    }

    /**
     * Check Connection is connected
     * @returns {boolean}
     */
    isConnected() {
        return this._connected;
    }

    /**
     * Publish a message to topic
     * @param topic
     * @param message
     */
    publish(topic, message, cb) {

        this.send({
            id: uuid(),
            action: 'topic_publish',
            payload: {
                name: topic,
                message: message
            }
        }, () => {
            if (cb) {
                cb();
            }
        })
    }

    /**
     * Sending a message to everyone else except me
     * @param topic
     * @param message
     * @param cb
     */
    broadcast(topic, message, cb) {

        this.send({
            id: uuid(),
            action: 'topic_broadcast',
            payload: {
                name: topic,
                message: message
            }
        }, () => {
            if (cb) {
                cb();
            }
        });


    }

    /**
     * Subscribe to topic
     * @param topic
     * @param cb
     */
    subscribe(topic, cb = () => {
    }) {

        this.send({
            id: uuid(),
            action: 'topic_subscribe',
            payload: {
                name: topic,
            }
        });

        this._event.addListener(`__topic__${topic}__message`, cb);
    }


    /**
     * Unsubscribe topic
     * @param topic
     * @param cb
     */
    unsubscribe(topic, cb) {
        this._event.removeListener(`__topic__${topic}__message`, cb);
    }
}