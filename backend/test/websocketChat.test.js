import { expect } from "chai";
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
    it('Test: connect and disconnect to server for /chat', (done) => {
        // connect to server
        clientSocket = ioc(CHAT_SERVER_URL, AUTH_OPTIONS('0001'));

        clientSocket.on('system message', (res) => {
            console.log(res);
            expect(res.event).to.be.equal('system message');
            expect(res.message.stage).to.be.equal('connect');
            expect(res.message.status).to.be.equal('success');

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

    it('Test: join chatroom (目前 user 是這次檔案傳輸的 sender)', (done) => {
        clientSocket2.emit('join chatroom', { chatroomName: '0002_0003' }); // 目前 user 的 userID: 0002

        clientSocket2.on('system message', (res) => {
            console.log(res);
            expect(res.event).to.be.equal('system message');
            expect(res.message.stage).to.be.equal('join chatroom');
            expect(res.message.status).to.be.equal('success');

            done();
        });
    });

    it('Test: join chatroom (目前 user 是這次檔案傳輸的 receiver)', (done) => {
        clientSocket2.emit('join chatroom', { chatroomName: '0003_0002' }); // 目前 user 的 userID: 0002

        clientSocket2.on('system message', (res) => {
            console.log(res);
            expect(res.event).to.be.equal('system message');
            expect(res.message.stage).to.be.equal('join chatroom');
            expect(res.message.status).to.be.equal('success');

            done();
        });
    });

    it('Test: join chatroom (目前 user 與這次檔案傳輸無關)', (done) => {
        clientSocket2.emit('join chatroom', { chatroomName: '0001_0004' }); // 目前 user 的 userID: 0002

        clientSocket2.on('system message', (res) => {
            console.log(res);
            expect(res.event).to.be.equal('system message');
            expect(res.message.stage).to.be.equal('join chatroom');
            expect(res.message.status).to.be.equal('fail');

            done();
        });
    });

    it('Test: join chatroom (sender、receiver 都是同一個人)', (done) => {
        clientSocket2.emit('join chatroom', { chatroomName: '0002_0002' }); // 不合法的房間名稱

        clientSocket2.on('system message', (res) => {
            console.log(res);
            expect(res.event).to.be.equal('system message');
            expect(res.message.stage).to.be.equal('join chatroom');
            expect(res.message.status).to.be.equal('fail');

            done();
        });
    });

    it('Test: join chatroom (傳輸雙方其中一方不是 user)', (done) => {
        clientSocket2.emit('join chatroom', { chatroomName: '0002_0005' }); // 目前所有 user 為 0002、0003

        clientSocket2.on('system message', (res) => {
            console.log(res);
            expect(res.event).to.be.equal('system message');
            expect(res.message.stage).to.be.equal('join chatroom');
            expect(res.message.status).to.be.equal('fail');

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

    it('Test: send message (給目前 user 所在的房間)', async () => {
        const message = 'Hi';
        clientSocket2.emit('chat message', { chatroomName: client1_2ChatroomName, message });

        await Promise.all([
            new Promise((resolve, reject) => {
                // chat 的發送方收到系統回傳結果通知
                clientSocket2.on('system message', (res) => {
                    console.log(res);
                    expect(res.event).to.be.equal('system message');
                    expect(res.message.stage).to.be.equal('chat message');
                    expect(res.message.status).to.be.equal('success');
                    resolve();
                });
            }),
            new Promise((resolve, reject) => {
                clientSocket3.on('chat message', (res) => {
                    console.log(res);
                    expect(res.event).to.be.equal('chat message');
                    expect(res.chatroomName).to.be.equal(client1_2ChatroomName);
                    expect(res.message).to.be.equal(message);
                    resolve();
                });
            }),
        ]);
    });

    it('Test: send message (給目前 user 不在的房間)', (done) => {
        const message = 'Hi';
        clientSocket2.emit('chat message', { chatroomName: '0005_0002', message });

        clientSocket2.on('system message', (res) => {
            console.log(res);
            expect(res.event).to.be.equal('system message');
            expect(res.message.stage).to.be.equal('chat message');
            expect(res.message.status).to.be.equal('fail');
            done();
        });
    });
});

describe('Test: invalid event', () => {
    let clientSocket4;

    beforeEach(async () => {
        // 建立 1 個 client
        clientSocket4 = ioc(CHAT_SERVER_URL, AUTH_OPTIONS('0004'));

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

    it('Test: invalid event', (done) => {
        clientSocket4.emit('xxxxxxxx', { chatroomName: '0002_0003' }); // 目前 user 的 userID: 0002

        clientSocket4.on('system message', (res) => {
            console.log(res);
            expect(res.event).to.be.equal('system message');
            expect(res.message.stage).to.be.equal('invalid event');
            expect(res.message.status).to.be.equal('fail');

            done();
        });
    });
});
