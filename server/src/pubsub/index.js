import {uuid} from '../lib/objectid'
import ClientManager, {Client} from "./client";
import TopicManager from "./topic";
import _ from 'lodash'
import CameraManager from "./camera";

export default class PubSub {
    constructor(ctx) {
        this.wss = ctx.wss;
        this.models = ctx.models;
        this.clients = new ClientManager();
        this.topics = new TopicManager();
        this.cameras = new CameraManager();

        this.authenticate = this.authenticate.bind(this);
        this.logout = this.logout.bind(this);
        this.publish = this.publish.bind(this);


        this.wss.on('connection', (ws) => {


            const clientId = this.autoId();

            const client = new Client({
                id: clientId,
                ws: ws,
                userId: null,
                tokenId: null
            });

            // save this client
            this.clients.set(client);

            ws.on('message', (data) => {

                this._handleClientMessage(clientId, data);
            });

            ws.on('close', () => {
                this.clients.remove(client);
                const camera = this.cameras.get(clientId);

                if (camera) {
                    this.publish(`camera_stop_${clientId}`, camera);
                    this.cameras.remove(client.id);// remove if this camera is live
                }

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


        let needReply = true;


        const client = this.clients.get(clientId);

        if (typeof data === 'string') {
            const message = this.messageToJSON(data);
            const action = _.get(message, 'action');
            const payload = _.get(message, 'payload');

            console.log("Client message:", message);


            let topic;
            let topicName;
            switch (action) {


                case 'me':

                    needReply = false;

                    client.send({
                        replyId: _.get(message, 'id'),
                        action: 'me',
                        payload: clientId,
                    });


                    break;


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

                case 'topic_broadcast':

                    topicName = _.get(payload, 'name');
                    this.publish(topicName, _.get(payload, 'message'), clientId);

                    break;

                case 'topic_subscribe':


                    topicName = _.get(payload, 'name');
                    topic = this.topics.set({
                        id: topicName
                    });

                    client.subscribe(topic);


                    break;


                // camera
                case 'camera_ready':

                    const newCamera = this.cameras.set(_.get(payload, 'name'), client);
                    needReply = false;
                    client.send({
                        replyId: _.get(message, 'id'),
                        action: 'camera_ready',
                        payload: newCamera,
                    });


                    break;

                case 'camera_stop':

                    this.cameras.remove(clientId);

                    break;

                case 'camera_list':

                    let items = [];

                    this.cameras.filter((camera) => camera).forEach((i) => {
                        items.push(i);
                    });

                    console.log("Cameras!!!!", items);


                    needReply = false; // don't need answer to client any more.
                    client.send({
                        replyId: _.get(message, 'id'),
                        action: 'camera_list',
                        payload: items,
                    });


                    break;


                default:
                    break;
            }


            // confirm to client we received.
            if (needReply) {
                client.send({
                    action: '__reply__',
                    replyId: _.get(message, 'id'),
                });
            }


        } else {
            console.log("Receive data message", data);
        }

    }

    logout(client) {

        const tokenId = _.get(client, 'tokenId');
        this.models.user.logout(tokenId).then((res) => {
            console.log("User logged out");
        }).catch((err) => {
            console.log("An error logout user", err);
        });
        client.userId = null;
        this.clients.set(client);

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
                client.tokenId = tokenId;
            }
            this.clients.set(client);
            return resolve(client);

        });


    }

    /**
     * Publish message to topic
     * @param name
     * @param message
     * @param clientId
     */
    publish(name, message, clientId = null) {

        let topic = this.topics.set({
            id: name
        });

        topic.publish(message, clientId);

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