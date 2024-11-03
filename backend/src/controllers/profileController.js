class ProfileController {
    async getStagingFile(req, res) {
        console.log('----ProfileController.getStagingFile');
        // TODO: 實現暫存檔案查詢
        res.status(200).json({ message: 'Get staging file logic not implemented yet' });
    }

    async getHistory(req, res) {
        console.log('----ProfileController.getHistory');
        // TODO: 實現歷史紀錄查詢
        res.status(200).json({ message: 'Get history logic not implemented yet' });
    }
}

export default ProfileController;
