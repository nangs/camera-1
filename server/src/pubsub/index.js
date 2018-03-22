import {uuid} from '../lib/objectid'
import ClientManager, {Client} from "./client";
import TopicManager from "./topic";
import _ from 'lodash'

export default class PubSub {
    constructor(ctx) {
        this.wss = ctx.wss;
        this.models = ctx.models;
        this.clients = new ClientManager();
        this.topics = new TopicManager();

        this.authenticate = this.authenticate.bind(this);
        this.logout = this.logout.bind(this);
        this.publish = this.publish.bind(this);


        this.wss.on('connection', (ws) => {


            const clientId = this.autoId();

            const client = new Client({
                id: clientId,
                ws: ws,
                userId: null,
            });

            // save this client
            this.clients.set(client);

            ws.on('message', (data) => {

                this._handleClientMessage(clientId, data);
            });

            ws.on('close', () => {
                this.clients.remove(client);
            });


        });
    }

    /**
     * Handle receive message from client
     * @param client
     * @param data
     * @private
     */
    _handleClientMessage(clientId, data) {


        const client = this.clients.get(clientId);

        if (typeof data === 'string') {
            const message = this.messageToJSON(data);
            const messageId = _.get(message, 'id');
            const action = _.get(message, 'action');
            const payload = _.get(message, 'payload');

            console.log("Client message:", message);
            // confirm to client we received.
            client.send({
                action: '__reply__',
                payload: messageId,
            });

            let topic;
            let topicName;
            switch (action) {

                case 'logout':

                    this.logout(client);

                    break;

                case 'auth':

                    this.authenticate(payload, client).then((c) => {
                        console.log("Client is authenticated", c);
                    }).catch((err) => {
                        console.log(err);
                    });

                    break;

                case 'topic_publish':

                    topicName = _.get(payload, 'name');
                    this.publish(topicName, _.get(payload, 'message'));

                    break;

                case 'topic_subscribe':


                    topicName = _.get(payload, 'name');
                    topic = this.topics.set({
                        id: topicName
                    });

                    client.subscribe(topic);


                    break;

                default:
                    break;
            }

        } else {
            console.log("Receive data message", data);
        }

    }

    logout(client) {
        client.userId = null;
        this.clients.set(client);
        client.logout();
    }

    /**
     * Authenticate client
     * @param tokenId
     * @param client
     */
    async authenticate(tokenId, client) {


        let decoded = null;

        try {
            decoded = await this.models.token.verifyToken(tokenId);
        }
        catch (err) {
            console.log(err);
        }

        return new Promise((resolve, reject) => {
            if (!decoded) {
                return reject("Unauthenticated");
            }
            if (decoded) {
                client.userId = _.get(decoded, 'userId', null);
            }
            this.clients.set(client);
            return resolve(client);

        });


    }

    /**
     * Publish message to topic
     * @param name
     * @param message
     */
    publish(name, message) {

        let topic = this.topics.set({
            id: name
        });

        topic.publish(message);

    }

    /**
     * String to JSON
     * @param message
     * @returns {*}
     */
    messageToJSON(message) {

        try {
            message = JSON.parse(message);
        }
        catch (err) {
            console.log("Unable parse message:", message);
        }
        return message;
    }

    autoId() {
        return uuid();
    }
}