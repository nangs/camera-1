import cors from 'cors'
import graphqlHTTP from 'express-graphql'
import Schema from './schema'
import {production, port} from "./config"
import _ from 'lodash'
import WebSocketServer from 'uws'
import http from 'http'
import express from 'express'
import PubSub from "./pubsub"
import Database from "./database"
import aws from 'aws-sdk'
import {s3Config} from "./aws"

aws.config.update({
    accessKeyId: s3Config.accessKeyId,
    secretAccessKey: s3Config.secretAccessKey,
    region: s3Config.region,
});

const S3 = new aws.S3({
    signatureVersion: 'v4',
});


const PORT = port;


const app = express();
const database = new Database();
const server = http.createServer(app);

const wss = new WebSocketServer.Server({
    server: server
});

const models = database.models();

app.pubSub = new PubSub({
    wss: wss,
    models: models,
});

app.use(cors({
    exposedHeaders: "*"
}));

const ctx = {
    models: models,
    S3: S3
};

app.use('/api', graphqlHTTP(async (request) => {

    let tokenId = request.header('authorization');
    if (!tokenId) {
        tokenId = _.get(request, 'query.auth', null);
    }
    request.ctx = ctx;
    let token = null;

    if (tokenId) {
        try {
            token = await ctx.models.token.verifyToken(tokenId);
        } catch (err) {
            console.log(err);
        }
    }
    request.token = token;
    return {
        schema: new Schema(ctx).schema(),
        graphiql: !production,
    };
}));

server.listen(PORT, () => {
    console.log(`App is running on port ${server.address().port}`);
});