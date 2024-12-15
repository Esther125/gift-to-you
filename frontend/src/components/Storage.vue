<template>
  <div class="storage-view">
    <h1 class="header">Storage Area</h1>
    <table class="table">
      <thead>
        <tr>
          <th>#</th>
          <th>檔案名稱</th>
          <th>下載</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(file, index) in files" :key="file.filename">
          <td>{{ index + 1 }}</td>
          <td>{{ file.filename }}</td>
          <td>
            <a :href="file.url" download class="download-link">下載</a>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 分頁按鈕 -->
    <div class="pagination">
      <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
        上一頁
      </button>
      <button
        v-for="page in lastKeys.length"
        :key="page"
        @click="changePage(page)"
        :class="{ active: currentPage === page }"
      >
        {{ page }}
      </button>
      <button @click="changePage(currentPage + 1)" :disabled="!hasMorePages">
        下一頁
      </button>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref } from "vue";

const files = ref([]);          // 當前頁面的檔案列表
const lastKeys = ref([null]);   // 每頁對應的 lastKey (第一頁為 null)
const currentPage = ref(1);     // 當前頁碼
const hasMorePages = ref(true); // 是否還有下一頁

// 請求檔案列表
const fetchFiles = async (page) => {
  try {
    const apiUrl = import.meta.env.VITE_BE_API_BASE_URL;
    const userId = "12346"; // 測試用 userId

    // 獲取 lastKey
    const lastKey = lastKeys.value[page - 1];

    const response = await axios.get(`${apiUrl}/staging-area`, {
      params: {
        userId: userId,
        lastKey: lastKey,
      },
    });

    const { file: newFiles, lastKey: nextLastKey } = response.data;

    // 更新檔案列表
    files.value = newFiles;

    // 記錄 下一頁的 lastKey
    if (lastKeys.value.length === page && nextLastKey) {
      lastKeys.value.push(nextLastKey);
    }

    currentPage.value = page;

    // 檢查是否還有更多頁
    hasMorePages.value = !!nextLastKey;
  } catch (error) {
    console.error("Error fetching file list:", error);
  }
};

// 切換頁碼
const changePage = (page) => {
  if (page < 1 || page > currentPage.value && !hasMorePages.value) {
    return;
  }
  fetchFiles(page);
};

fetchFiles(1);
</script>


<style scoped>
.storage-view {
  width: 90%;
  max-width: 1000px;
  margin: 50px auto;
  padding: 20px;
  background-color: var(--color-background-soft);
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.header {
  text-align: center;
  color: var(--color-heading);
  margin-bottom: 20px;
  font-size: 1.8rem;
}

.table {
  width: 100%;
  border-collapse: collapse;
  color: var(--color-text);
  background: var(--color-background-2);
}

.table th,
.table td {
  border: 1px solid var(--color-border);
  padding: 10px;
  text-align: center;
  word-wrap: break-word;
}

.table th {
  background-color: var(--color-background-mute);
  color: var(--color-heading);
}

.table tr:nth-child(even) {
  background-color: var(--color-background-soft);
}

.table tr:hover {
  background-color: var(--color-border-hover);
  transition: background-color 0.3s ease;
}

.download-link {
  text-decoration: none;
  color: var(--color-heading);
  font-weight: bold;
}

.download-link:hover {
  color: var(--vt-c-indigo);
  text-decoration: underline;
}
</style>