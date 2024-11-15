import crypto from 'crypto';

class RoomService {
    constructor() {
        this._rooms = {};
    }

    _createToken = () => {
        let token = '';

        const charArr = new Uint8Array(5);
        crypto.getRandomValues(charArr);

        charArr.forEach((c) => {
            let code = Math.abs((c - 65) % 26) + 65;
            token += String.fromCharCode(code);
        });

        return token;
    };

    _createRoom = (user) => {
        console.log('-----RoomService createRoom');

        // 1. check whether user has been in a room or not
        for (let token in this._rooms) {
            if (this._rooms[token].indexOf(user.id) !== -1) {
                console.log('Recently Rooms:\n' + JSON.stringify(this._rooms));
                return token;
            }
        }

        // 2. create room token
        let token = this._createToken();
        // make sure the token is unique
        while (this._rooms[token]) {
            token = this._createToken();
        }

        // 3. add user to room array
        this._rooms[token] = [user.id];

        // 4. log recently room
        console.log('Recently Rooms:\n' + JSON.stringify(this._rooms));

        return token;
    };

    _leaveRoom = (user) => {
        for (let token in this._rooms) {
            const userIndex = this._rooms[token].indexOf(user.id);
            if (userIndex !== -1) {
                this._rooms[token].splice(userIndex, 1);
                if (this._rooms[token].length === 0) {
                    delete this._rooms[token];
                }
                break;
            }
        }
    };
}

export default RoomService;
