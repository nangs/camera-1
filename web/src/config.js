const production = false;

const productionConfig = {
    url: 'https://camera.homekitvietnam.com',
    api: 'https://camera.homekitvietnam.com/api',
    webSocketUrl: 'wss://transcode.livex.tv',
};
const localIp = '127.0.0.1';
const developmentConfig = {
    url: `http://${localIp}:3001`,
    api: `http://${localIp}:3001/api`,
    webSocketUrl: `ws://${localIp}:3001`,
};

export const config = production ? productionConfig : developmentConfig;