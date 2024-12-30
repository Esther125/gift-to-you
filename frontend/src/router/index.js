import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import api from '@/api/api';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
            meta: { requireAuth: 'once' },
        },
        {
            path: '/about',
            name: 'about',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/StorageView.vue'),
            meta: { requireAuth: 'always' },
        },
        {
            path: '/history',
            name: 'history',
            component: () => import('../views/HistoryView.vue'),
            meta: { requireAuth: 'always' },
        },
        {
            path: '/register',
            name: 'register',
            component: () => import('../views/RegisterView.vue'),
        },
        {
            path: '/logout',
            name: 'logout',
            component: () => import('../views/LogoutView.vue'),
            meta: { requireAuth: 'always' },
        },
    ],
});

router.beforeEach(async (to, from, next) => {
    const requireAuth = to.meta.requireAuth;
    const query = to.query;
    const toPath = to.fullPath;
    if (!requireAuth) {
        next();
        return;
    }

    if (requireAuth === 'once' && to.query.isChecked === 'true') {
        next();
        return;
    }

    try {
        await api.get('/auth-check', { params: { toPath, routerQuery: query } });
        next();
    } catch (error) {
        next(false);
    }
});

export default router;
