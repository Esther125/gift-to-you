<script setup>
import { ref } from 'vue';
import { useGlobalStore } from '../stores/globals.js';
import axios from 'axios';

const store = useGlobalStore();

const userID = store.user.id;
const userName = ref();
const email = ref();
const password = ref();

const registerStatus = ref('default');

const BE_API_BASE_URL = import.meta.env.VITE_BE_API_BASE_URL;

const registerHandler = async () => {
    try {
        const { data } = await axios.get(`${BE_API_BASE_URL}/`);
        const tempUserId = data.userId;
        const response = await axios.post(
            `${BE_API_BASE_URL}/register`,
            {
                userID: tempUserId,
                email: email.value.toLowerCase(),
                password: password.value.toLowerCase(),
                userName: userName.value.toLowerCase(),
            },
            { withCredentials: true }
        );
        registerStatus.value = response.data.message;
        if (registerStatus.value === 'User already registered') {
            setTimeout(() => {
                registerStatus.value = 'default';
            }, 2000);
        }
    } catch (error) {
        console.error('Error register: ', error);
    }
};
</script>

<template>
    <div class="register my-5 d-flex flex-column w-100">
        <h3 class="text-center w-100">用戶註冊</h3>
        <form @submit.prevent="registerHandler" class="w-75" style="max-width: 30rem; min-width: 20rem">
            <div class="my-3 d-flex justify-content-center gap-3 w-100">
                <label for="userName" style="text-align: right">用戶名稱</label>
                <input
                    id="userName"
                    class="flex-fill"
                    type="text"
                    minlength="3"
                    maxlength="8"
                    pattern="^\S+$"
                    v-model="userName"
                    required
                    style="text-transform: lowercase"
                />
            </div>
            <div class="my-3 d-flex justify-content-center gap-3 w-100">
                <label for="email" style="text-align: right">電子郵件</label>
                <input
                    id="email"
                    class="flex-fill"
                    type="email"
                    pattern="^\S+$"
                    style="text-transform: lowercase"
                    v-model="email"
                    required
                />
            </div>
            <div class="my-3 d-flex justify-content-center gap-3 w-100">
                <label for="password" style="text-align: right">密　　碼</label>
                <input
                    id="password"
                    class="flex-fill"
                    type="password"
                    pattern="^\S+$"
                    style="text-transform: lowercase"
                    v-model="password"
                    required
                />
            </div>
            <div class="d-flex justify-content-center my-4">
                <button type="submit" class="btn btn-primary" v-if="registerStatus === 'default'">註冊</button>
                <div
                    class="text-success d-flex gap-2 justify-content-center"
                    v-else-if="registerStatus === 'Register success'"
                >
                    <i class="bi bi-check-circle"></i>
                    <span>註冊完成</span>
                </div>
                <div class="text-danger d-flex gap-2 justify-content-center" v-else>
                    <i class="bi bi-x-circle"></i>
                    <span>該帳號已註冊</span>
                </div>
            </div>
        </form>
    </div>
</template>

<style scoped>
.register {
    display: flex;
    align-items: center;
}
</style>
