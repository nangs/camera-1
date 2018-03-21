let didInit = false;

export default class PubSub {
    constructor(ctx) {
        if (didInit) {
            throw new Error("Can not init PubSub twice.");
        }
        didInit = true;
        this.wss = ctx.wss;
        this.models = ctx.models;
    }
}