import ClientPubSub from "./pubsub";
import {ws} from "./config";
import {EventEmitter} from 'fbemitter'
import {AsyncStorage} from 'react-native'
import Service from "./service";
import {api} from "./config";

export default class AppStore {
    constructor() {

        this._connected = false;

        this.queue = [];
        this.event = new EventEmitter();
        this.token = this.getToken();
        this.user = this.getUser();
        this.service = new Service(api);

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

    /**
     * Set token to storage
     * @param token
     */
    setToken(token = null) {
        this.token = token;
        AsyncStorage.setItem('@tabvn_camera:token', token ? JSON.stringify(token) : "");
    }

    /**
     * Get Token From storage
     * @returns {Promise<*>}
     */
    async getToken() {
        if (this.token) {
            return this.token;
        }
        let _token = null;
        try {
            _token = await AsyncStorage.getItem('@tabvn_camera:token');

            try {
                _token = JSON.parse(_token);
            }
            catch (err) {

            }
        } catch (error) {

        }
        return _token;
    }

    /**
     * Get user from storage
     * @returns {Promise<*>}
     */
    async getUser() {

        let _user = null;
        try {
            const userString = await AsyncStorage.getItem('@tabvn_camera:user');
            if (userString) {
                try {
                    _user = JSON.parse(userString);
                }
                catch (err) {

                }
            }
        } catch (error) {

        }
        return _user;
    }

    /**
     * Set user to storage
     * @param user
     */
    setUser(user = null) {

        this.user = user;
        AsyncStorage.setItem('@tabvn_camera:user', user ? JSON.stringify(user) : "");

    }

    /**
     * Login user
     * @param email
     * @param password
     * @returns {Promise<any>}
     */
    login(email, password) {
        return new Promise((resolve, reject) => {

            const fields = {
                id: true,
                userId: true,
                created: true,
                user: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    created: true,
                }

            };

            this.service.mutation('login', {email: email, password: password}, fields).then((res) => {

                const user = _.get(res, 'user');

                const token = {
                    id: _.get(res, 'id'),
                    userId: _.get(res, 'userId'),
                    created: _.get(res, 'created')
                };
                this.setToken(token);
                this.setUser(user);
                return resolve(res);

            }).catch((err) => {
                return reject(err);
            })
        })
    }

    /**
     * Create user account
     * @param user
     * @returns {Promise<any>}
     */
    register(user) {
        return new Promise((resolve, reject) => {
            const email = _.get(user, 'email', '');
            const password = _.get(user, 'password');

            const fields = {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                created: true,
            };

            this.service.mutation('create_user', {email: email, password: password}, fields).then((res) => {

                return resolve(res);

            }).catch((err) => {
                return reject(err);
            })
        })
    }

    /**
     * Start camera stream
     */
    start_camera() {

        this.event.emit('start_camera', true);
        this.recoding = true;

    }

    /**
     * Stop Camera
     */
    stop_camera() {
        this.recoding = false;
        this.event.emit('start_camera', false);
    }

    /**
     * Check if client is connected to server
     * @returns {boolean}
     */
    connected() {

        return this._connected;
    }

    /**
     * Run all queue
     */
    runQueue() {
        if (this.queue.length) {
            this.queue.forEach((q, index) => {
                this.executeQueue(q);
                _.unset(this.queue, index);

            });
        }
    }


    /**
     * Do single queue
     * @param q
     */
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

    /**
     * Get client ID
     * @returns {*}
     */
    clientId() {
        if (this.connected()) {
            return this.pubsub.id();
        }
        return null;

    }
}