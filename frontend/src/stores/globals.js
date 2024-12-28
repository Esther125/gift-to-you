import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';

export const useGlobalStore = defineStore('global', () => {
    const user = ref({
        id: '',
        name: '',
    });

    const roomToken = ref();
    const qrCodeSrc = ref();
    const members = ref([]);
    const namePairs = reactive({});
    const clientSocket = ref(null);

    const loginStatus = ref('');

    return { user, roomToken, qrCodeSrc, members, namePairs, clientSocket, loginStatus };
});
