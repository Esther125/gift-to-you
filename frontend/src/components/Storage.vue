<template>
  <div class="storage-view">
    <h1 class="header">Storage Area</h1>
    <table class="table">
      <thead>
        <tr>
          <th>#</th>
          <th>檔案名稱</th>
          <th>時間</th>
          <th>下載</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(file, index) in files" :key="file.filename">
          <td>{{ index + 1 }}</td>
          <td>{{ file.filename }}</td>
          <td>{{ file.lastModified }}</td>
          <td>
            <a :href="file.url" download class="download-link">下載</a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import axios from 'axios';

const fetchFiles = async () => {
    try {
        const apiUrl = import.meta.env.VITE_BE_API_BASE_URL;
        const userId = "12346"; // 測試用 userID

        const response = await axios.get(`${apiUrl}/api/v1/staging-area`, {
            params: {
                userId: userId, // 將 userId 作為參數
            },
        });
        console.log(response.data);
        files.value = response.data.file;
    } catch (error) {
        console.error("Error fetching file list:", error);
    }
};

fetchFiles();
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