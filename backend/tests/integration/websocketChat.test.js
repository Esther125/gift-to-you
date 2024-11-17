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

2. event: chat message
    {
        event: 'chat message',
        chatroomName,
        message,
        timestamp: new Date().toISOString(),
    }
*/

const CHAT_SERVER_URL = `http://localhost:3000/chat`;
const AUTH_OPTIONS = (userID) => ({
    auth: {
        user: {
            id: userID,
        },
    },
});

describe('Test: connect and disconnect to server for /chat', () => {
    let clientSocket;
    test('Test: connect and disconnect to server for /chat', (done) => {
        // connect to server
        clientSocket = ioc(CHAT_SERVER_URL, AUTH_OPTIONS('0001'));

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

describe('Test: join chatroom', () => {
    let clientSocket2;
    let clientSocket3;

    beforeEach(async () => {
        // 建立 2 個 client
        clientSocket2 = ioc(CHAT_SERVER_URL, AUTH_OPTIONS('0002'));
        clientSocket3 = ioc(CHAT_SERVER_URL, AUTH_OPTIONS('0003'));

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

    test('Test: join chatroom (目前 user 是這次檔案傳輸的 sender)', (done) => {
        clientSocket2.emit('join chatroom', { chatroomName: '0002_0003' }); // 目前 user 的 userID: 0002

        clientSocket2.on('system message', (res) => {
            console.log(res);
            expect(res.event).toEqual('system message');
            expect(res.message.stage).toEqual('join chatroom');
            expect(res.message.status).toEqual('success');

            done();
        });
    });

    test('Test: join chatroom (目前 user 是這次檔案傳輸的 receiver)', (done) => {
        clientSocket2.emit('join chatroom', { chatroomName: '0003_0002' }); // 目前 user 的 userID: 0002

        clientSocket2.on('system message', (res) => {
            console.log(res);
            expect(res.event).toEqual('system message');
            expect(res.message.stage).toEqual('join chatroom');
            expect(res.message.status).toEqual('success');

            done();
        });
    });

    test('Test: join chatroom (目前 user 與這次檔案傳輸無關)', (done) => {
        clientSocket2.emit('join chatroom', { chatroomName: '0001_0004' }); // 目前 user 的 userID: 0002

        clientSocket2.on('system message', (res) => {
            console.log(res);
            expect(res.event).toEqual('system message');
            expect(res.message.stage).toEqual('join chatroom');
            expect(res.message.status).toEqual('fail');

            done();
        });
    });

    test('Test: join chatroom (sender、receiver 都是同一個人)', (done) => {
        clientSocket2.emit('join chatroom', { chatroomName: '0002_0002' }); // 不合法的房間名稱

        clientSocket2.on('system message', (res) => {
            console.log(res);
            expect(res.event).toEqual('system message');
            expect(res.message.stage).toEqual('join chatroom');
            expect(res.message.status).toEqual('fail');

            done();
        });
    });

    test('Test: join chatroom (傳輸雙方其中一方不是 user)', (done) => {
        clientSocket2.emit('join chatroom', { chatroomName: '0002_0005' }); // 目前所有 user 為 0002、0003

        clientSocket2.on('system message', (res) => {
            console.log(res);
            expect(res.event).toEqual('system message');
            expect(res.message.stage).toEqual('join chatroom');
            expect(res.message.status).toEqual('fail');

            done();
        });
    });
});

describe('Test: chat message', () => {
    let clientSocket2;
    let clientSocket3;
    let client1_2ChatroomName = '0002_0003';

    beforeEach(async () => {
        // 建立 2 個 client
        clientSocket2 = ioc(CHAT_SERVER_URL, AUTH_OPTIONS('0002'));
        clientSocket3 = ioc(CHAT_SERVER_URL, AUTH_OPTIONS('0003'));

        await Promise.all([
            new Promise((resolve, reject) => {
                clientSocket2.on('system message', (res) => {
                    resolve();
                });
            }),
            new Promise((resolve, reject) => {
                clientSocket3.on('system message', (res) => {
                    resolve();
                });
            }),
        ]);

        // client 1 和 client 2 加入相同聊天室
        clientSocket2.emit('join chatroom', { chatroomName: client1_2ChatroomName });
        clientSocket3.emit('join chatroom', { chatroomName: client1_2ChatroomName });

        await Promise.all([
            new Promise((resolve, reject) => {
                clientSocket2.on('system message', (res) => {
                    resolve();
                });
            }),
            new Promise((resolve, reject) => {
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

    test('Test: send message (給目前 user 所在的房間)', async () => {
        const message = 'Hi';
        clientSocket2.emit('chat message', { chatroomName: client1_2ChatroomName, message });

        await Promise.all([
            new Promise((resolve, reject) => {
                // chat 的發送方收到系統回傳結果通知
                clientSocket2.on('system message', (res) => {
                    console.log(res);
                    expect(res.event).toEqual('system message');
                    expect(res.message.stage).toEqual('chat message');
                    expect(res.message.status).toEqual('success');
                    resolve();
                });
            }),
            new Promise((resolve, reject) => {
                clientSocket3.on('chat message', (res) => {
                    console.log(res);
                    expect(res.event).toEqual('chat message');
                    expect(res.chatroomName).toEqual(client1_2ChatroomName);
                    expect(res.message).toEqual(message);
                    resolve();
                });
            }),
        ]);
    });

    test('Test: send message (給目前 user 不在的房間)', (done) => {
        const message = 'Hi';
        clientSocket2.emit('chat message', { chatroomName: '0005_0002', message });

        clientSocket2.on('system message', (res) => {
            console.log(res);
            expect(res.event).toEqual('system message');
            expect(res.message.stage).toEqual('chat message');
            expect(res.message.status).toEqual('fail');
            done();
        });
    });
});
