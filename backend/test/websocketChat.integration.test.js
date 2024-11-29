import { expect } from 'chai';
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
        roomToken,
        message: {
            senderID,
            content
        },
        timestamp: new Date().toISOString(),
    }
    
3. event: transfer notify
    {
        event: 'transfer notify',
        roomToken,
        senderID,
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
    it('Test: connect and disconnect to server for /chat (with correct connection format)', (done) => {
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

    it('Test: connect and disconnect to server for /chat (with wrong connection format, without auth)', (done) => {
        // connect to server
        clientSocket = ioc(CHAT_SERVER_URL);

        clientSocket.on('system message', (res) => {
            console.log(res);
            expect(res.event).to.be.equal('system message');
            expect(res.message.stage).to.be.equal('connect');
            expect(res.message.status).to.be.equal('fail');
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

    it('Test: join chatroom (user 有在該房間內)', (done) => {
        clientSocket2.emit('join chatroom', { roomToken: 'ABCDE' });

        clientSocket2.on('system message', (res) => {
            console.log(res);
            expect(res.event).to.be.equal('system message');
            expect(res.message.stage).to.be.equal('join chatroom');
            expect(res.message.status).to.be.equal('success');

            done();
        });
    });
});

describe('Test: other (after joining chatroom)', () => {
    let clientSocket2;
    let clientSocket3;
    let client2_3RoomToken = 'ABCDE';

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
        clientSocket2.emit('join chatroom', { roomToken: client2_3RoomToken });
        clientSocket3.emit('join chatroom', { roomToken: client2_3RoomToken });

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

    describe('Test: request transfer', () => {
        it('Test: request transfer (有存在該 room 的 user)', async () => {
            clientSocket2.emit('request transfer', { roomToken: client2_3RoomToken, receiverID: '0003' });

            await Promise.all([
                new Promise((resolve, reject) => {
                    // sender 收到 server 回覆成功處理
                    clientSocket2.on('system message', (res) => {
                        console.log(res);
                        expect(res.event).to.be.equal('system message');
                        expect(res.message.stage).to.be.equal('request transfer');
                        expect(res.message.status).to.be.equal('success');
                        resolve();
                    });
                }),
                new Promise((resolve, reject) => {
                    // receiver 收到系統的傳送通知
                    clientSocket3.on('transfer notify', (res) => {
                        console.log(res);
                        expect(res.event).to.be.equal('transfer notify');
                        expect(res.roomToken).to.be.equal(client2_3RoomToken);
                        expect(res.senderID).to.be.equal('0002');
                        resolve();
                    });
                }),
            ]);
        });

        it('Test: request transfer (不存在的 user)', (done) => {
            clientSocket2.emit('request transfer', { roomToken: client2_3RoomToken, receiverID: '0005' }); // 目前有的 user: 0002、0003

            clientSocket2.on('system message', (res) => {
                console.log(res);
                expect(res.event).to.be.equal('system message');
                expect(res.message.stage).to.be.equal('request transfer');
                expect(res.message.status).to.be.equal('fail');

                done();
            });
        });

        it('Test: request transfer (傳給自己)', (done) => {
            clientSocket2.emit('request transfer', { receiverID: '0002' });

            clientSocket2.on('system message', (res) => {
                console.log(res);
                expect(res.event).to.be.equal('system message');
                expect(res.message.stage).to.be.equal('request transfer');
                expect(res.message.status).to.be.equal('fail');

                done();
            });
        });
    });

    describe('Test: chat message', () => {
        it('Test: send message (給目前 user 所在的房間)', async () => {
            const message = 'Hi';
            clientSocket2.emit('chat message', { roomToken: client2_3RoomToken, message });

            await Promise.all([
                new Promise((resolve, reject) => {
                    // sender 收到系統回傳結果通知
                    clientSocket2.on('system message', (res) => {
                        console.log(res);
                        expect(res.event).to.be.equal('system message');
                        expect(res.message.stage).to.be.equal('chat message');
                        expect(res.message.status).to.be.equal('success');
                        resolve();
                    });
                }),
                new Promise((resolve, reject) => {
                    // chatroom 中其他 user 收到訊息
                    clientSocket3.on('chat message', (res) => {
                        console.log(res);
                        expect(res.event).to.be.equal('chat message');
                        expect(res.roomToken).to.be.equal(client2_3RoomToken);
                        expect(res.message.senderID).to.be.equal('0002');
                        expect(res.message.content).to.be.equal(message);
                        resolve();
                    });
                }),
            ]);
        });

        it('Test: send message (給目前 user 不在的房間)', (done) => {
            const message = 'Hi';
            clientSocket2.emit('chat message', { roomToken: '30943', message });

            clientSocket2.on('system message', (res) => {
                console.log(res);
                expect(res.event).to.be.equal('system message');
                expect(res.message.stage).to.be.equal('chat message');
                expect(res.message.status).to.be.equal('fail');
                done();
            });
        });
    });

    describe('Test: leave chatroom', () => {
        it('Test: leave chatroom (目前 user 所在的房間)', async () => {
            clientSocket2.emit('leave chatroom', { roomToken: client2_3RoomToken });

            await new Promise((resolve, reject) => {
                clientSocket2.on('system message', (res) => {
                    console.log(res);
                    expect(res.event).to.be.equal('system message');
                    expect(res.message.stage).to.be.equal('leave chatroom');
                    expect(res.message.status).to.be.equal('success');
                    resolve();
                });
            });
        });

        it('Test: leave chatroom (目前 user 不在的房間)', async () => {
            clientSocket2.emit('leave chatroom', { roomToken: '30943' });

            await new Promise((resolve, reject) => {
                clientSocket2.on('system message', (res) => {
                    console.log(res);
                    expect(res.event).to.be.equal('system message');
                    expect(res.message.stage).to.be.equal('leave chatroom');
                    expect(res.message.status).to.be.equal('fail');
                    resolve();
                });
            });
        });
    });

    describe('Test: invalid event', () => {
        it('Test: invalid event', (done) => {
            clientSocket2.emit('xxxxxxxx');

            clientSocket2.on('system message', (res) => {
                console.log(res);
                expect(res.event).to.be.equal('system message');
                expect(res.message.stage).to.be.equal('invalid event');
                expect(res.message.status).to.be.equal('fail');

                done();
            });
        });
    });
});
