<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useGlobalStore } from '../stores/globals.js';
import axios from 'axios';

const store = useGlobalStore();
const apiUrl = import.meta.env.VITE_BE_API_BASE_URL;

const userID = store.user.id;
// const userID = '12346';
const totalFilesCount = ref(0);
const tempFiles = reactive([]);
const prevLastKey = ref(null);

const tempFilesContainer = ref(null);
const currentCount = ref(0);

onMounted(async () => {
    await getNextTempFiles(null);
    await nextTick();

    if (_checkNotEnoughFiles() && prevLastKey.value !== "undefined") {
      await getNextTempFiles(prevLastKey.value);
    }

    const container = tempFilesContainer.value;
    container.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
    unhandleScroll();
});

// 取暫存區資料
const getNextTempFiles = async (lastKey) => {
    console.log('Get new TempFiles');

    try {
        const { data } = await axios.get(`${apiUrl}/staging-area`, {
            params: {
                id: userID,
                type: 'user',
                ...(lastKey ? { lastKey: decodeURIComponent(lastKey) } : {}),
            },
        });

        if (data && Array.isArray(data.file) && data.file.length > 0) {
            totalFilesCount.value += data.file.length;

            data.file.forEach((item) => {
                currentCount.value++;
                tempFiles.push({ index: currentCount.value, ...item });
            });

            prevLastKey.value = data.lastKey || null;
        } else {
            console.log('No more files or unexpected API response:', data);
            prevLastKey.value = null;
        }
    } catch(error) {
        console.error('Error getting new TempFiles:', error);
    }
};

// 判斷是否需抓下頁資料
const isHandling = ref(false);
const handleScroll = async () => {
    const container = tempFilesContainer.value;

    // 判斷是否需要下一頁
    if (!isHandling.value && _checkNotEnoughFiles() && prevLastKey.value !== null) {
        isHandling.value = true;

        try {
            const lastKey = prevLastKey.value;

            if (!lastKey || lastKey === "undefined") {
                console.log('No more pages to load');
                unhandleScroll();
                return;
            }

            console.log('Loading next page');
            await getNextTempFiles(lastKey);
        } catch (error) {
            console.error('Error loading next page:', error);
        } finally {
            isHandling.value = false;
        }
    }  
};

const unhandleScroll = () => {
    const container = tempFilesContainer.value;
    if (container) {
        console.log('Removing scroll event listener'); 
        container.removeEventListener('scroll', handleScroll);
    }
};

const _checkNotEnoughFiles = () => {
    const container = tempFilesContainer.value;
    if (!container) return false;

    return container.scrollTop + container.clientHeight >= container.scrollHeight - 2;
};

// ---- download preSigned URL ----
const isDownloading = ref(false);

const downloadFile = async (originalName) => {
    if (isDownloading.value) return;
    isDownloading.value = true;

    try {
        const { data } = await axios.get(`${apiUrl}/staging-area/download`, {
            params: {
                userId: userID,
                filename: originalName
            },
        });
        if (data.url) {
            window.open(data.url, '_blank');
        }
    } catch (error) {
        console.error('Error downloading file:', originalName, error);
    } finally {
        isDownloading.value = false;
    }
};
</script>

<template>
    <div class="container-fluid d-flex flex-column m-0 py-0 px-5 h-100 w-100" style="max-width: 100vw">
        <h2 class="m-0 pt-3 pb-0">檔案暫存區</h2>
        <div class="flex-fill px-2" style="overflow-y: scroll" ref="tempFilesContainer">
        <!-- 檔案清單 -->
        <div
            v-if="totalFilesCount > 0"
            v-for="file in tempFiles"
            :key="`file-${file.index}`"
            class="file-card w-100 my-2 d-flex align-items-center py-1 rounded"
        >
            <div class="mx-3">{{ file.index }}</div>
            <i class="bi bi-file-earmark-text mx-2" style="font-size: 3rem"></i>
            <div class="vr my-2"></div>
            <div class="w-100 mx-3" style="overflow: hidden">
                <div style="font-weight: bold; font-size: 1.3rem">
                    {{ file.filename }}
                </div>
            </div>
            <div class="vr my-2"></div>
            <!-- 下載按鈕 -->
            <div class="mx-2 text-center">
                <button 
                    :disable="isDownloading"
                    class="btn btn-primary w-100" 
                    style="min-width: 120px;" 
                    @click="downloadFile(file.originalName)"
                >
                    <i class="bi bi-download"></i> 下載
                </button>
            </div>
        </div>
        <div class="text-center" v-else-if="totalFilesCount === 0">暫無檔案</div>
    </div>
    </div>
</template>

<style scoped>
.file-card {
    background-color: var(--color-background-mute);
}

.btn-outline-secondary:hover {
    background-color: inherit;
    color: inherit;
    border-color: inherit;
}

/* 滾動條樣式 */
::-webkit-scrollbar {
    width: 12px;
    height: 12px;
}

::-webkit-scrollbar-thumb {
    background: var(--color-text);
    border-radius: 6px;
}

::-webkit-scrollbar-track {
    background: var(--color-background-mute);
    border-radius: 6px;
}
</style>
