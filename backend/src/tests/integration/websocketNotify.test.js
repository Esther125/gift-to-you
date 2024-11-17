import { io as ioc } from 'socket.io-client';

/*
expected response structure
1. event: system message
    {
        event: 'system message',
        message: {
            stage,
            status,
        },
        timestamp: new Date().toISOString(),
    }

2. event: transfer notify
    {
        event: 'transfer notify',
        senderID,
        timestamp: new Date().toISOString(),
    }
*/

const NOTIFY_SERVER_URL = `http://localhost:3000/notify`;
const AUTH_OPTIONS = (userID) => ({
    auth: {
        user: {
            id: userID,
        },
    },
});

describe('Test: connect and disconnect to server for /notify', () => {
    let clientSocket;
    test('Test: connect and disconnect to server for /notify', (done) => {
        // connect to server
        clientSocket = ioc(NOTIFY_SERVER_URL, AUTH_OPTIONS('0001'));

        clientSocket.on('system message', (res) => {
            console.log(res);
            expect(res.event).toEqual('system message');
            expect(res.message.stage).toEqual('connect');
            expect(res.message.status).toEqual('success');

            clientSocket.disconnect();
            done();
        });
    });
});

describe('Test: request transfer', () => {
    let clientSocket2;
    let clientSocket3;

    beforeEach(async () => {
        // 建立 2 個 client
        clientSocket2 = ioc(NOTIFY_SERVER_URL, AUTH_OPTIONS('0002'));
        clientSocket3 = ioc(NOTIFY_SERVER_URL, AUTH_OPTIONS('0003'));

        await Promise.all([
            new Promise((resolve, reject) => {
                clientSocket2.on('system message', (res) => {
                    resolve();
                });
            }),
            await new Promise((resolve, reject) => {
                clientSocket3.on('system message', (res) => {
                    resolve();
                });
            }),
        ]);
    });

    afterEach(async () => {
        // disconnect with server
        await Promise.all([
            new Promise((resolve, reject) => {
                if (clientSocket2.connected) {
                    clientSocket2.disconnect();
                }
                resolve();
            }),
            new Promise((resolve, reject) => {
                if (clientSocket3.connected) {
                    clientSocket3.disconnect();
                }
                resolve();
            }),
        ]);
    });

    test('Test: request transfer (有存在的 user)', async () => {
        clientSocket2.emit('request transfer', { receiverID: '0003' });

        await Promise.all([
            new Promise((resolve, reject) => {
                // sender 收到 server 回覆成功處理
                clientSocket2.on('system message', (res) => {
                    console.log(res);
                    expect(res.event).toEqual('system message');
                    expect(res.message.stage).toEqual('request transfer');
                    expect(res.message.status).toEqual('success');
                    resolve();
                });
            }),
            new Promise((resolve, reject) => {
                // receiver 收到系統的傳送通知
                clientSocket3.on('transfer notify', (res) => {
                    console.log(res);
                    expect(res.event).toEqual('transfer notify');
                    expect(res.senderID).toEqual('0002');
                    resolve();
                });
            }),
        ]);
    });

    test('Test: request transfer (不存在的 user)', (done) => {
        clientSocket2.emit('request transfer', { receiverID: '0005' }); // 目前有的 user: 0002、0003

        clientSocket2.on('system message', (res) => {
            console.log(res);
            expect(res.event).toEqual('system message');
            expect(res.message.stage).toEqual('request transfer');
            expect(res.message.status).toEqual('fail');

            done();
        });
    });

    test('Test: request transfer (傳給自己)', (done) => {
        clientSocket2.emit('request transfer', { receiverID: '0002' }); // 目前有的 user: 0002、0003

        clientSocket2.on('system message', (res) => {
            console.log(res);
            expect(res.event).toEqual('system message');
            expect(res.message.stage).toEqual('request transfer');
            expect(res.message.status).toEqual('fail');

            done();
        });
    });
});

describe('Test: invalid event', () => {
    let clientSocket4;

    beforeEach(async () => {
        // 建立 1 個 client
        clientSocket4 = ioc(NOTIFY_SERVER_URL, AUTH_OPTIONS('0004'));

        await new Promise((resolve, reject) => {
            clientSocket4.on('system message', (res) => {
                resolve();
            });
        });
    });

    afterEach(async () => {
        // disconnect with server
        if (clientSocket4.connected) {
            clientSocket4.disconnect();
        }
    });

    test('Test: invalid event', (done) => {
        clientSocket4.emit('xxxxxxxx', { message: 'dddddd' });

        clientSocket4.on('system message', (res) => {
            console.log(res);
            expect(res.event).toEqual('system message');
            expect(res.message.stage).toEqual('invalid event');
            expect(res.message.status).toEqual('fail');

            done();
        });
    });
});
