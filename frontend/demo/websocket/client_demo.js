import wsClient from '../../src/socket/client.js';

const chatroomInput = document.querySelector('#chatroom-input');
const chatroomJoinBtn = document.querySelector('#chatroom-join');
const chatroomLeaveBtn = document.querySelector('#chatroom-leave');
const messageBox = document.querySelector('#message-box');
const messageInput = document.querySelector('#message-input');
const messageSendBtn = document.querySelector('#message-send');

const client = new wsClient(messageBox);

chatroomInput.addEventListener('keyup', (event) => {
    if (event.keyCode == 13) {
        chatroomJoinBtn.click();
    }
});

chatroomJoinBtn.onclick = () => {
    const newChatroomID = chatroomInput?.value;
    client.joinChatroom(newChatroomID);
};

chatroomLeaveBtn.onclick = async () => {
    await client.leaveChatroom();
    chatroomInput.value = '';
};

messageInput.addEventListener('keyup', (event) => {
    if (event.keyCode == 13) {
        messageSendBtn.click();
    }
});

messageSendBtn.onclick = () => {
    const msg = messageInput?.value;
    if (!msg) {
        return;
    }

    if (!client.ws) {
        client.showMessage("(Haven't joined a chatroom yet)");
        return;
    }

    client.ws.send(msg);
    client.showMessage(`Sent: ${msg}\n${new Date().toLocaleString()}`);
    messageInput.value = '';
};
