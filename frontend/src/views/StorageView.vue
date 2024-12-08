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
            <div v-for="file in files" :key="file.filename" class = "row" >
                {{ console.log(file.originalName) }}
                <!-- 文件夾圖示 -->
                <div class = "column file-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <path d="M0 96C0 60.7 28.7 32 64 32l132.1 0c19.1 0 37.4 7.6 50.9 21.1L289.9 96 448 96c35.3 0 64 28.7 64 64l0 256c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zM64 80c-8.8 0-16 7.2-16 16l0 320c0 8.8 7.2 16 16 16l384 0c8.8 0 16-7.2 16-16l0-256c0-8.8-7.2-16-16-16l-161.4 0c-10.6 0-20.8-4.2-28.3-11.7L213.1 87c-4.5-4.5-10.6-7-17-7L64 80z"/>
                    </svg>
                </div>

                <!-- 檔案名稱 -->
                <div class="column file-name">
                    {{ files.originalName }}
                </div>

                <!-- 下載圖示 -->
                <div class="column download-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 242.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7 288 32zM64 352c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-101.5 0-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352 64 352zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/>
                    </svg>
                </div>
            </div>
        </div>
    </div>
</template>


<style scoped>
/* 整個頁面 */
.storage-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #dbdbdb;
  border-radius: 5px; /* 保留圓角效果 */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* 添加陰影代替邊框 */
  height: 75vh; 
  width: 1200px;
}

/* 表格標題 */
.header {
  border: none;
  text-align: center;
  font-size: 24px;
  padding: 5px;
  font-weight: bold;
  color: #383838;
  border-bottom: 3px solid #383838;
}

/* 內容 */
.container {
  width: 90%; /* 外框寬度 */
  height: 750px; /* 外框高度 */
  margin-top: 20px;
  background-color: #ffffff ; /* 背景顏色 */
  border: none;
  border-radius: 5px; /* 保留圓角效果 */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* 添加陰影代替邊框 */
  display: flex; /* 為後續添加內容準備 */
  flex-direction: column; /* 內容從上到下排列 */
  justify-content: flex-start; 
  align-items: flex-start; 
  font-size: 24px;
  padding: 20px;
  color: #383838;
}

/* 表格每一行 */
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  width: 100%;
  border-bottom: 1px solid #ddd;
  box-sizing: border-box;
}


/* 每個欄位 */
.column {
  flex: 1; /* 欄位平分寬度 */
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 文件夾圖示 */
.file-icon {
  flex: 0.2; /* 欄位占比較小空間 */
  text-align: left; /* 圖示置中 */
  justify-content: flex-start; /* 靠左對齊 */
  padding-left: 10px;
}

/* 檔案名稱欄位 */
.file-name {
  flex: 4; /* 欄位占比較大空間 */
  text-align: left; /* 左對齊 */
  padding-left: 15px; /* 內邊距 */
  font-size: 30px;
  color: #383838;
  word-break: break-word; /* 如果名稱太長自動換行 */
  verflow-wrap: break-word;
  align-items: left; 
}

/* 下載圖示 */
.download-icon {
  flex: 0.2; /* 欄位占比較小空間 */
  text-align: right; /* 圖示置中 */
  justify-content: flex-end; /* 靠右對齊 */
  padding-right: 10px;
  cursor: pointer; /* 鼠標變為點擊手勢 */
}

</style>