<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGlobalStore } from '../stores/globals.js';
import * as bootstrap from 'bootstrap';
import axios from 'axios';

const router = useRouter();
const BE_API_BASE_URL = import.meta.env.VITE_BE_API_BASE_URL;

const toPath = ref('');

const store = useGlobalStore();

let modalInstance;

const email = ref('');
const password = ref('');
const loginStatus = ref('default');

const loginHandler = async () => {
    try {
        const response = await axios.post(
            `${BE_API_BASE_URL}/login`,
            { email: email.value, password: password.value },
            { withCredentials: true }
        );
        loginStatus.value = 'success';

        // make modal disappear after 3 seconds and go to next page
        if (toPath.value !== '/logout') {
            router.push({ path: toPath.value });
        } else {
            sessionStorage.removeItem('roomToken');
            store.roomToken = '';
            router.push({ path: '/' });
        }

        setTimeout(() => {
            modalInstance.hide();
        }, 3000);
    } catch (error) {
        console.error('Error login: ', error);
        loginStatus.value = 'fail';
        setTimeout(() => {
            loginStatus.value = 'default';
        }, 3000);
    }
};

const registerHandler = () => {
    modalInstance.hide();
    router.push({ path: '/register' });
};

const initModal = () => {
    const modalElement = document.getElementById('loginModal');
    modalInstance = new bootstrap.Modal(modalElement);
};

const showModal = (event) => {
    toPath.value = event.detail.toPath;
    if (modalInstance) {
        loginStatus.value = 'default';

        // clean out input
        email.value = '';
        password.value = '';

        modalInstance.show();
    }
};

onMounted(() => {
    initModal();
    window.addEventListener('show-login-modal', showModal);
});
</script>

<template>
    <div class="modal fade" id="loginModal" tabindex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header pt-3 pb-2 border-0">
                    <h5 class="modal-title b" id="loginModalLabel">用戶登入</h5>
                </div>
                <div class="modal-body">
                    <form @submit.prevent="loginHandler">
                        <div class="m-3 d-flex justify-content-around">
                            <label for="email">帳號</label>
                            <input id="email" class="w-75" type="email" v-model="email" required />
                        </div>
                        <div class="m-3 d-flex justify-content-around">
                            <label for="password">密碼</label>
                            <input id="password" class="w-75" type="password" v-model="password" required />
                        </div>
                        <button type="submit" class="btn btn-primary" v-if="loginStatus === 'default'">登入</button>
                        <div
                            class="text-success d-flex gap-2 justify-content-center"
                            v-else-if="loginStatus === 'success'"
                        >
                            <i class="bi bi-check-circle"></i>
                            <span>登入成功</span>
                        </div>
                        <div class="text-danger d-flex gap-2 justify-content-center" v-else-if="loginStatus === 'fail'">
                            <i class="bi bi-x-circle"></i>
                            <span>登入失敗</span>
                        </div>
                    </form>
                    <div class="m-3 d-flex justify-content-around">
                        <a class="text-secondary" @click="registerHandler">立即註冊</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
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

a:hover {
    text-decoration: underline;
    background-color: unset;
    cursor: pointer;
}
</style>
