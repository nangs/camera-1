import ClientPubSub from "./pubsub";
import {ws} from "./config";

export default class AppStore {
    constructor() {
        this.pubsub = new ClientPubSub({reconnect: true, url: ws});

        this.pubsub.onClose((e) => {
            console.log("Connection is closed", e);

        });
        this.pubsub.onError((e) => {

            console.log("Connection is error", e);
        });

        this.pubsub.connect((err) => {
            if (err) {
                console.log("An error connecting to the server", err);

                return;

            }
            console.log("Success connected to the server");

            this.pubsub.subscribe('tabvn', (message) => {
                console.log("receive from subscriber", message);
            });

            this.pubsub.publish('tabvn', {hi: "toan", date: new Date()}, () => {
                console.log("Message published to the server");
            });


        })
    }
}