import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import Particles from '@tsparticles/vue3';
import { loadFull } from 'tsparticles';
import fileIconsPlugin from './plugins/fileIconsPlugin';

const app = createApp(App);

app.use(Particles, {
    init: async (engine) => {
        await loadFull(engine);
    },
});

// 註冊 icon plugin
app.use(fileIconsPlugin);

app.use(router);
app.use(createPinia());

app.mount('#app');
