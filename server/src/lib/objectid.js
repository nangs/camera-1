import ramdom from 'uuid/v4'

export const uuid = ramdom;

export default class ObjectID {
    constructor() {
        this.toString = this.toString.bind(this);
        this._random = uuid();
    }

    toString() {
        return this._random;
    }
}