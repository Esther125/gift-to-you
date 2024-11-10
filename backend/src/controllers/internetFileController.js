import InternetFileService from '../services/internetFileService.js';
import path from 'path';

class InternetFileController {
    constructor() {
        this.fileService = new InternetFileService();
        this.upload = this.upload.bind(this);
        this.download = this.download.bind(this);
    }

    async upload(req, res) {
        console.log('----InternetFileController.upload');
        // 實現上傳檔案邏輯
        try {
            const filename = await this.fileService.upload(req, res);
            const fileId = path.basename(filename, path.extname(filename));
            res.json({ message: 'File successfully uploaded', fileId: fileId });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error uploading file', error: error.message });
        }
    }

    async download(req, res) {
        console.log('----InternetFileController.download');
        // TODO: 實現下載檔案邏輯
        res.status(200).json({ message: 'File download logic not implemented yet' });
    }
}

export default InternetFileController;
