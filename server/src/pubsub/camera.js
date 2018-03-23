import {Map} from 'immutable'

export default class CameraManager {

    constructor() {
        this.cameras = new Map();
    }

    filter(predicate) {
        return this.cameras.filter(predicate);
    }

    set(name, client) {

        let camera = this.cameras.get(client.id);
        if (!camera) {
            camera = new Camera(name, client);
        } else {
            camera.name = name;
            camera.userId = client.userId;
            camera.clientId = client.id;
        }
        this.cameras = this.cameras.set(client.id, camera);
        return camera;

    }

    get(clientId) {
        return this.cameras.get(clientId);
    }

    remove(clientId) {
        this.cameras = this.cameras.remove(clientId);
    }
}

export class Camera {

    constructor(name, client) {
        this.name = name;
        this.clientId = client.id;
        this.userId = client.userId;
    }
}