const production = false;

const productionConfig = {
    url: 'https://camera.homekitvietnam.com',
    api: 'https://camera.homekitvietnam.com/api',
    webSocketUrl: 'wss://transcode.livex.tv',
};

const developmentConfig = {
    url: 'http://127.0.0.1:3001',
    api: 'http://127.0.0.1:3001/api',
    webSocketUrl: 'ws://127.0.0.1:3001',
};

export const config = production ? productionConfig : developmentConfig;