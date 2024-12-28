<script setup>
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router';
import { ref, reactive, onMounted, onBeforeUnmount, watch, nextTick, computed } from 'vue';
import axios from 'axios';
import api from '@/api/api';
import { useGlobalStore } from './stores/globals.js';
import { io as ioc } from 'socket.io-client';
import Login from './components/LoginModal.vue';
import Logout from './components/LogoutModal.vue';

/* ------------------------------
   Variables
-------------------------------- */
const BE_API_BASE_URL = import.meta.env.VITE_BE_API_BASE_URL;
const CHAT_SERVER_URL = import.meta.env.VITE_CHAT_SERVER_URL;
const isDarkTheme = ref(false);
const icon = ref();

const characters = reactive(['', '', '', '', '']);
const inputRefs = ref([]);

const store = useGlobalStore();
const router = useRouter();
const route = useRoute();

const buttonNavbarKey = computed(() => {
    console.log('change', `${store.user.id}_${store.roomToken}`);
    return `${store.user.id}_${store.roomToken}`;
});

/* ------------------------------
   Event Handlers
-------------------------------- */
const themeChangeHandler = (event) => {
    isDarkTheme.value = event.matches;
};

const iconChange = (isDarkTheme) => {
    if (isDarkTheme) {
        icon.value = '../src/assets/images/logo/icon_light.png';
    } else {
        icon.value = '../src/assets/images/logo/icon_dark.png';
    }
};

const roomModalHandler = async () => {
    try {
        if (!store.roomToken || !store.qrCodeSrc) {
            // call room create api
            const { data } = await axios.post(`${BE_API_BASE_URL}/rooms`, { user: store.user });
            store.roomToken = data.token;
            store.qrCodeSrc = data.qrCodeDataUrl;
            console.log('roomToken: ' + store.roomToken);
            sessionStorage.setItem('roomToken', store.roomToken);
            sessionStorage.setItem('qrCodeSrc', store.qrCodeSrc);

            // websocket join room
            if (store.clientSocket) {
                store.clientSocket.emit('join chatroom', { roomToken: store.roomToken });
            }
        }
        showRoomModal();
        router.push({ path: '/', query: { roomToken: store.roomToken, needJoinRoom: 'false' } });
    } catch (error) {
        console.error('Error creating room: ', error);
    }
};

const moveToNext = async (index) => {
    // 如果當前輸入框有值，且不是最後一個輸入框，則移動到下一個框
    if (characters[index] && index < characters.length - 1) {
        await nextTick(); // 等待 DOM 更新完成
        inputRefs.value[index + 1]?.focus();
    }
};

const handleBackspace = async (index) => {
    // 如果按下 Backspace 且當前輸入框沒有值，則移動到前一個框
    if (characters[index] === '' && index > 0) {
        await nextTick(); // 等待 DOM 更新完成
        inputRefs.value[index - 1]?.focus();
    }
};

const joinRoom = async () => {
    // leave old room
    if (store.roomToken) {
        const { data } = await axios.post(`${BE_API_BASE_URL}/rooms/${store.roomToken}/leave`, { user: store.user });
        if (data.message === 'success') {
            store.clientSocket.emit('leave chatroom', { roomToken: store.roomToken });
        }
    }

    // join new room
    let inputRoomToken = characters.join('').toUpperCase();
    if (inputRoomToken.length === 5) {
        store.roomToken = inputRoomToken;
        sessionStorage.setItem('roomToken', inputRoomToken);
        roomModalInstance.hide();
        await router.push({ path: '/', query: { roomToken: inputRoomToken } });
    } else {
        alert('邀請碼不存在');
    }
};

const leaveRoom = async () => {
    if (store.roomToken) {
        const { data } = await axios.post(`${BE_API_BASE_URL}/rooms/${store.roomToken}/leave`, { user: store.user });
        if (data.message === 'success') {
            store.clientSocket.emit('leave chatroom', { roomToken: store.roomToken });
        }
    }

    clearRoomData();
    router.push({ path: '/' });
};

const clearRoomData = () => {
    store.roomToken = null;
    store.qrCodeSrc = null;
    store.members = [];
    sessionStorage.removeItem('roomToken');
    sessionStorage.removeItem('qrCodeSrc');
    sessionStorage.removeItem('messages');
};

const onModalHide = () => {
    characters.splice(0, characters.length, ...new Array(5).fill(''));

    // 遍歷所有輸入框並移除焦點
    inputRefs.value.forEach((input) => {
        if (input) {
            input.blur();
        }
    });
};

const AUTH_OPTIONS = (userID) => ({
    auth: {
        user: {
            id: userID,
        },
    },
});

let roomModalInstance;
const initRoomModal = () => {
    const modalElement = document.getElementById('roomModal');
    roomModalInstance = new bootstrap.Modal(modalElement);
};

const showRoomModal = () => {
    if (roomModalInstance) {
        roomModalInstance.show();
    }
};

const homeHandler = () => {
    if (store.roomToken) {
        router.push({ path: '/', query: { roomToken: store.roomToken, needJoinRoom: 'false' } });
    } else {
        router.push({ path: '/' });
    }
};

const loginStatusChangeHandler = async (event) => {
    // change login status
    const oldLoginStatus = store.loginStatus;
    store.loginStatus = event.detail.login;

    // change userId
    let userId = '';
    if (event.detail.login === true) {
        console.log('login');
        const response = await api.get('/auth-check');
        userId = response.data.userID;
    } else {
        console.log('logout');
        if (oldLoginStatus === '' && sessionStorage.getItem('userId')) {
            // refresh page
            userId = sessionStorage.getItem('userId');
        } else {
            const response = await axios.get(`${BE_API_BASE_URL}/`);
            userId = response.data.userId;
        }
    }
    store.user.id = userId;
    sessionStorage.setItem('userId', userId);

    // clean old room
    store.roomToken = null;
    store.qrCodeSrc = null;
    sessionStorage.removeItem('roomToken');
    sessionStorage.removeItem('qrCodeSrc');

    // rebuild WebSocket connection
    if (store.clientSocket) {
        store.clientSocket.removeAllListeners();
        store.clientSocket.disconnect();
    }
    store.clientSocket = ioc(CHAT_SERVER_URL, AUTH_OPTIONS(store.user.id));
    console.log('WebSocket - connect');

    // get old roomToken if exists
    await new Promise((resolve, reject) => {
        store.clientSocket.once('system message', async (res) => {
            store.roomToken = res.roomToken;
            resolve();
        });
    });

    // setup websocket listener
    store.clientSocket.on('system message', (res) => {
        console.log('WebSocket - system message');
        console.log(res);
    });

    store.clientSocket.on('room notify', async (res) => {
        if ((res.roomToken === store.roomToken) & (res.type === 'join')) {
            const { data } = await axios.post(`${BE_API_BASE_URL}/rooms/${store.roomToken}/members`);
            store.members = data.members;
        } else if ((res.roomToken === store.roomToken) & (res.type === 'leave')) {
            const { data } = await axios.post(`${BE_API_BASE_URL}/rooms/${store.roomToken}/members`);
            store.members = data.members;
        }
    });

    store.clientSocket.on('disconnect', (reason) => {
        console.log('WebSocket - disconnect');
        console.log(reason);
    });
    
    // handla qrcode
    const scan = route.query.scan;
    if (scan === 'true') {
        store.roomToken = route.query.roomToken;

        // set scan to false
        await router.replace({
            ...route,
            query: {
                ...route.query,
                scan: 'false',
            },
        });
    }

    // go to room page
    if (store.roomToken) {
        sessionStorage.setItem('roomToken', store.roomToken);

        const { path, query } = router.currentRoute.value;
        router.push({ path, query: { roomToken: store.roomToken, needJoinRoom: true, ...query } });
    }
};

/* ------------------------------
   Watchers, Computed
   -------------------------------- */
watch(isDarkTheme, iconChange);

/* ------------------------------
   Lifecycle Hooks
-------------------------------- */
onMounted(async () => {
    // check theme
    isDarkTheme.value = window.matchMedia('(prefers-color-scheme: dark').matches;
    // add event listener
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', themeChangeHandler);
    // init icon
    iconChange(isDarkTheme.value);

    // change id when login status change
    window.addEventListener('login-check-result', async (event) => {
        if (event.detail.login !== store.loginStatus) {
            await loginStatusChangeHandler(event);
        }
    });

    // init room modal
    initRoomModal();

    // for setup
    store.isLogin = '';
    await api.get('/auth-check');
});

onBeforeUnmount(() => {
    // remove event listener
    window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', themeChangeHandler);
});
</script>

<template>
    <nav class="navbar navbar-expand-md fixed-top">
        <div class="container-fluid">
            <a class="navbar-brand" @click="homeHandler">
                <img :src="icon" width="30" height="24" class="d-inline-block align-text-top" />
                CloudDrop
            </a>
            <div class="d-flex justify-content-end align-items-center">
                <div class="mx-1">
                    <i class="bi bi-people-fill h3 icon" @click="roomModalHandler"></i>
                </div>

                <li class="nav-item dropdown mx-1">
                    <a
                        class="nav-link dropdown-toggle"
                        href="#"
                        id="navbarDropdown"
                        aria-expanded="false"
                        data-bs-toggle="dropdown"
                    >
                        <i class="bi bi-person-lines-fill h3 icon"></i>
                    </a>
                    <ul
                        :class="['dropdown-menu', { 'dropdown-menu-dark': isDarkTheme }]"
                        aria-labelledby="navbarDropdown"
                        style="position: absolute; top: 100%; left: auto; right: 0"
                    >
                        <li>
                            <RouterLink to="/about" class="dropdown-item">
                                <div><i class="bi bi-collection-fill h5 icon me-1"></i> Temporary Storage</div>
                            </RouterLink>
                        </li>
                        <li>
                            <RouterLink to="/history" class="dropdown-item">
                                <div><i class="bi bi-clock-history h5 icon me-1"></i> History</div>
                            </RouterLink>
                        </li>
                        <li>
                            <RouterLink to="/logout" class="dropdown-item">
                                <div v-if="store.loginStatus == true">
                                    <i class="bi bi-box-arrow-right h5 icon me-1"></i> Logout
                                </div>
                                <div v-else><i class="bi bi-box-arrow-in-right h5 icon me-1"></i> Login</div>
                            </RouterLink>
                        </li>
                    </ul>
                </li>
            </div>
        </div>
    </nav>

    <div class="d-flex align-items-center router-view-container" id="particles-container">
        <RouterView />
    </div>

    <!-- Room Modal -->
    <div
        class="modal fade"
        id="roomModal"
        tabindex="-1"
        aria-labelledby="roomModalLabel"
        aria-hidden="true"
        v-on="{ 'hide.bs.modal': onModalHide }"
    >
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header pt-3 pb-2 border-0">
                    <h5 class="modal-title" id="roomModalLabel">創建或加入房間</h5>
                </div>
                <div class="modal-body d-flex flex-column">
                    <div class="d-flex justify-content-center mb-3">
                        <div v-for="(letter, index) in store.roomToken" :key="index" class="letter-box">
                            {{ letter }}
                        </div>
                    </div>
                    <div>
                        <img :src="store.qrCodeSrc" />
                    </div>
                    <div class="d-flex flex-row justify-content-center">
                        <div v-for="(char, index) in characters" :key="index" class="me-2 mt-4">
                            <input
                                type="text"
                                maxlength="1"
                                class="form-control text-center input-box"
                                v-model="characters[index]"
                                @input="moveToNext(index)"
                                @keydown.backspace="handleBackspace(index)"
                                ref="inputRefs"
                                :ref="(el) => (inputRefs.value[index] = el)"
                            />
                        </div>
                    </div>
                </div>
                <div class="modal-footer justify-content-center border-0">
                    <button class="btn btn-secondary" type="submit" data-bs-dismiss="modal" @click="leaveRoom">
                        離開
                    </button>
                    <button class="btn btn-success" type="submit" @click="joinRoom">加入</button>
                </div>
            </div>
        </div>
    </div>

    <Login />
    <Logout />

    <nav class="navbar navbar-expand-md fixed-bottom justify-content-center navbar-bottom" :key="buttonNavbarKey">
        <div class="d-flex justify-content-center align-items-center mb-2">
            <p class="mx-1 mb-0 p-1">裝置名稱：{{ store.user.id.slice(0, 8) }}</p>
            <p class="mb-0 p-1" v-if="store.roomToken || ''">|</p>
            <p class="mx-1 mb-0 p-1" v-if="store.roomToken">可見於 {{ store.roomToken }} 房間中</p>
        </div>
    </nav>
</template>

<style scoped>
.navbar {
    background-color: var(--color-background-mute);
}

.navbar-bottom {
    background-color: var(--color-background);
}

.navbar-brand:hover,
.icon:hover,
.link:hover {
    background-color: var(--color-background-soft);
    cursor: pointer;
}

.icon {
    color: var(--color-text);
}

.dropdown .ul .li {
    background-color: var(--color-background-mute);
    color: var(--color-text);
}

.navbar-brand {
    color: var(--color-text);
}

.dropdown:hover .dropdown-menu {
    display: block;
    margin-top: 0;
}

.dropdown-toggle::after {
    display: none !important;
}

li {
    list-style-type: none;
}

.card {
    background-color: var(--color-card-background);
}

.modal-header,
.modal-footer {
    border-bottom: 0px;
    border-top: 0px;
}

.modal-content {
    background-color: var(--color-background-soft);
    color: var(--color-text);
    text-align: center;
}

.modal-title {
    width: 100%;
}

.modal-body {
    padding: 5px;
}

.letter-box {
    height: 100%;
    width: 6%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background-color: var(--color-modal-text-background);
    font-weight: bolder;
    margin: 0 3px;
}

.input-box {
    width: 50px;
    height: 50px;
    text-align: center;
}

.router-view-container {
    flex: 1;
    max-height: calc(100vh - 111px);
    height: calc(100vh - 111px);
    margin-top: 58px;
    background-color: var(--color-background);
}

a:hover {
    cursor: pointer;
}
</style>
