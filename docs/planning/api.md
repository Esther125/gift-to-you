# API
<img src="../assets/system_design/API 架構.jpg" width=65%>

## 說明
### 資料傳輸

分成 Sender 和 Receiver
-   Sender：資料上傳（upload）與 資料傳送（send）
-   Receiver：資料下載（download）與 資料儲存（save）
    -   {way}：資料下載與儲存 的 方法（ 儲存到暫存區、System file 以及 雲端硬碟）

### 房間管理

分成 房間建置、加入房間 和 離開房間
-   Create：建立房間
-   Join：利用 {roomId} 分辨房間，並加入該房間
-   Lesve：利用 {roomId} 分辨房間，並離開該房間

### 用戶管理

分成 進入主頁、註冊 和 登入
-   Home page：進入主頁後，給使用者 userId
-   Register：用戶註冊
-   Login：用戶登入
-   Logout：用戶登出

### 紀錄管理

分成 個人檔案暫存區 和 歷史紀錄區
-   Staging-area：獲取暫存區資料(staging-area) 與 資料下載（download）
    -   {way}：資料下載與儲存 的 方法（ 儲存到暫存區、System file 以及 雲端硬碟）
-   History：獲取 檔案傳輸歷史紀錄區 資料（history）


