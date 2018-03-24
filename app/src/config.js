export const production = false;
const ip = `192.168.0.248`;
export const ws = `ws://${ip}:3001`;
export const api = production ? 'https://camera.tabvn.com': `http://${ip}:3001/api`;

