import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import fileIconsPlugin from './plugins/fileIconsPlugin';

const app = createApp(App);

// 註冊 icon plugin
app.use(fileIconsPlugin);

app.use(router);
app.use(createPinia());

app.mount('#app');
