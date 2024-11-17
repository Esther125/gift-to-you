# API

<img src="../assets/system_design/API 架構.jpg" width=100%>

## HTTP

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

## WebSocket

<img src="../assets/system_design/api_websocket.png" width="50%">

-   建立連線：-- client 端在使用各服務前須先與對應的 namespace 建立連線

    ```js
    const socket = io(`${serverURL}/${namespace}`, {
        auth: {
            user: {
                id: userID;
            }
        }
    });
    ```

-   event handler

    ```js
    // event handler
    socket.on(eventName, (payload) => {
        // ...
    });
    ```

-   關閉連線：

    ```js
    socket.disconnect();
    ```

### 傳輸通知 -- namespace: notify

-   使用期間：

    -   建立連線：使用者進入網頁。
    -   關閉連線：使用者離開網頁。

-   相關事件：

    -   由 client 端向 server 端發起的事件 + 發起方式：

        1. request transfer -- 傳送方欲傳送檔案給接收方

            ```js
            socket.emit('request transfer', { receiverID });
            ```

    -   由 server 端向 client 端發送的事件 + 接收到的資料格式：

        1. system message -- server 端處理完事件後回傳處理結果通知給 client

            ```js
            {
                event: 'system message',
                message: {
                    stage,   // 對應處理的事件名稱
                    status,  // success, fail, error
                },
                timestamp: new Date().toISOString(),
            }
            ```

        2. transfer notify -- server 向傳輸的接收方寄送傳輸通知

            ```js
            {
                event: 'transfer notify',
                senderID,
                timestamp: new Date().toISOString(),
            }
            ```

### 聊天室 -- namespace: chat

-   使用期間：

    -   建立連線：使用者同意進行一對一檔案傳輸。
        -   sender：發送 request transfer 後收到 status 為 success 的 system message 時。
        -   receiver：收到 transfer notify 後接受檔案傳輸時。
    -   關閉連線：傳輸雙方結束一對一檔案傳輸一定時間後。

-   相關事件：

    -   由 client 端向 server 端發起的事件 + 發起方式：

        1. join chatroom -- 建立雙人聊天室

            ```js
            // chatroomName 格式：{senderID}_{receiverID}
            socket.emit('join chatroom', { chatroomName });
            ```

        2. chat message -- 向雙人聊天室發送訊息

            ```js
            socket.emit('chat message', { chatroomName, message });
            ```

    -   由 server 端向 client 端發送的事件 + 接收到的資料格式：

        1. system message -- server 端處理完事件後回傳處理結果通知給 client

            ```js
            {
                event: 'system message',
                message: {
                    stage,   // 對應處理的事件名稱
                    status,  // success, fail, error
                },
                timestamp: new Date().toISOString(),
            }
            ```

        2. chat message -- 來自雙人聊天室中對方傳來的訊息

            ```js
            {
                event: 'chat message',
                chatroomName,
                message,
                timestamp: new Date().toISOString(),
            }
            ```
