# 團隊合作

## Branching Model

Branching Model 採用 Git Flow 模式。

開發過程中主要會由 develop 開出新的 branch，在一 branch 功能開發完成，經過 code review 後，再透過 pull request merge 回 develop。

各功能 branch 命名規則會以 Jira 系統的 issue 編號為前綴，後面再加上該 branch 的功能名稱，branch 中的各次 commit 也會以 issue 編號為前綴。

develop 則在完成階段性成果後，經過最後測試、調整，確定各部分整合皆沒有問題後，合併至 main，確保 main branch 維持穩定能夠正常運作的版本，並達到備份、保障的目的。

## Tello 專案管理模式

（Trello 連結：https://trello.com/b/btrvjPfC/project-development）

為了使用 Jira 系統提供的 issue 編號與連結管理 branch、commit 資訊的功能，因此我們會同時使用 Jira 與 Trello 2 個系統，並透過 Trello + Jira Two-Way Sync 的小工具來達成自 Jira 同步卡片至 Trello。

看板共劃分為 5 個 column，依序為 To-do、In Progress、Blocked、Verified、Done。

使用時機依序如下：

- To-do：新創建的任務，還沒開始執行。

- In Progress：任務進行中。

- Blocked：任務進行中，遇到問題卡住需要協助、討論。

- Verified：任務完成，須待其他組員 code review、確認。

- Done：任務完成。

在每一個 sprint 開始前的會議中，會這次 sprint 中各個獨立的任務新增為卡片，並指派給對應的任務負責人，另外會以 tag 標記任務性質，包含前端、後端、UI/UX、其他（如：Meeting，視情況增加）等。

## 開會時間

以一個禮拜為一個週期，視情況共開會 1 至 2 次，時間如下：

1. 星期天 20:00：主要大會，重點討論事項、分配當周任務。
2. 星期四 21:00：星期四 13:00 前於 confluence 中登記當周進度完成狀況，視是否有需討論的事項決定是否於晚上開會。
