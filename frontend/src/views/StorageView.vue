<script setup>
import { ref, watchEffect } from 'vue';
import axios from 'axios';

const files = ref([]); // 存檔案列表
const userId = "12346"; // 先測試用
const apiUrl = import.meta.env.VITE_BE_API_BASE_URL;

watchEffect(async () => {
    try {
        const response = await axios.get(`${apiUrl}/staging-area/${userId}`);
        files.value = response.data.file;
    } catch (error) {
        console.error("Error fetching files:", error);
    }
});
</script>


<template>
    <div class="storage-view">
        <!-- 頁面標題 -->
        <div class="header">
            <h1>Storage Area</h1>
        </div>

        <!-- 檔案列表 表格 -->
        <div class="container">
            <table class = "table table-striped table-hover table-sm">
                <thead>
                    <tr>
                        <th scope="col" style="width: 3%;">#</th>
                        <th scope="col" style="width: 3%;"></th> <!-- Icon欄位，無標題 -->
                        <th scope="col" style="width: 91%; ; max-width: 60%;">檔案名稱</th>
                        <th scope="col" style="width: 3%;" class="text-center">下載</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(file, index) in files" :key="file.filename">
                        <th scope="row">{{ index + 1 }}</th>
                        <!-- Icon欄 -->
                        <td class="text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon">
                                <path
                                d="M0 96C0 60.7 28.7 32 64 32l132.1 0c19.1 0 37.4 7.6 50.9 21.1L289.9 96 448 96c35.3 0 64 28.7 64 64l0 256c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zM64 80c-8.8 0-16 7.2-16 16l0 320c0 8.8 7.2 16 16 16l384 0c8.8 0 16-7.2 16-16l0-256c0-8.8-7.2-16-16-16l-161.4 0c-10.6 0-20.8-4.2-28.3-11.7L213.1 87c-4.5-4.5-10.6-7-17-7L64 80z"
                                />
                            </svg>
                        </td>

                        <!-- 檔案名稱欄 -->
                        <td>{{ file.originalName }}</td>

                        <!-- 下載欄 -->
                        <td class="text-center">
                            <a :href="file.url" download>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon">
                                    <path
                                    d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 242.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7 288 32zM64 352c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-101.5 0-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352 64 352zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"
                                    />
                                </svg>
                            </a>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>


<style scoped>
/* 整個頁面 */
.storage-view {
    padding: 20px;
    background-color: #dbdbdb;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    height: 75vh;
    max-width: 90%; /* 最大寬度 */
    margin: 0 auto; /* 水平置中 */
    display: block; /* 改用 block 佈局 */
}

/* 表格標題 */
.header {
    border: none;
    text-align: center;
    font-size: 24px;
    padding: 5px 0;
    font-weight: bold;
    color: #383838;
    border-bottom: 3px solid #383838;
    margin-bottom: 30px;
}

.table {
    width: 100%; /* 表格寬度 */
    table-layout: fixed; /* 固定表格佈局 */
    word-wrap: break-word;
}

.icon {
    width: 20px;
    height: 20px;
    fill: currentColor;
    cursor: pointer;
}

</style>