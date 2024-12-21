<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useGlobalState } from '../stores/globals.js';
import axios from 'axios';
import { logWithFileInfo } from '../../logger.js';

const store = useGlobalState();
const apiUrl = import.meta.env.VITE_BE_API_BASE_URL;

const userID = store.user.id;
const totalFilesCount = ref(0);
const tempFiles = reactive([]);
const prevLastKey = ref(null);

const tempFilesContainer = ref(null);
const currentCount = ref(0);

onMounted(async () => {
    await getNextTempFiles(null);
    await nextTick();
    while (_checkNotEnoughFiles() && prevLastKey.value !== null) {
      await getNextTempFiles(prevLastKey.value);
    }

    const container = tempFilesContainer.value;
    container.addEventListener('scroll', handleScroll);
});

onUnMounted(() => {
    unhadleScroll();
));

// 取暫存區資料
const getNextTempFiles = async (lastKey) => {
    try {
        const { data } = await axios.get(`${apiUrl}/staging-area`, {
            params: {
                id: userID,
                type: 'user',
                lastKey: lastKey
            },
        });

        if (data) {
            totalFilesCount.value += data.totalCount || data.items.length;
            data.items.forEach((item) => {
                currentCount.value++;
                tempFiles.push({ index: currentCount.value, ...item });
            });
            prevLastKey.value = data.lastKey;
        }
    } catch(error) {
        logWithFileInfo('error', `Error getting temporary files`, error);
    }
};

// 判斷是否需抓下頁資料
const isHandling = ref(false);
const handleScroll = async () => {
    const container = tempFilesContainer.value;
    if (!isHandling.value && _checkNotEnoughFiles()) {
        isHandling.value = true;
      
        const lastKey = prevLastKey.value;
        if (lastKey === null) {
            unhadleScroll();
            stopWatchHeight();
            return;
        }
        await getNextTempFiles(lastKey);
        isHandling.value = false;
    }
};

const unhandleScroll = () => {
    const container = tempFilesContainer.value;
    container.removeEventListener('scroll', handleScroll);
};

const _checkNotEnoughFiles = () => {
    const container = tempFilesContainer.value;
    return container.scrollTop + container.clientHeight >= container.scrollHeight - 2;
};

// ---- download preSigned URL ----
const downloadFile = async (filename) => {
    try {
        const { data } = await axios.get(`${apiUrl}/staging-area/download`, {
            params: {
                userId: userID,
                filename: filename
            },
        });
        if (data.url) {
            window.open(data.url, '_blank');
        }
    } catch(error) {
        logWithFileInfo('error', `Error downloading file ${filename}`, error);
    }
};
</script>

<template>
</template>
