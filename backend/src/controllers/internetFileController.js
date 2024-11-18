import InternetFileService from '../services/internetFileService.js';
import path from 'path';

class InternetFileController {
    constructor() {
        this.internetFileService = new InternetFileService();
        this.upload = this.upload.bind(this);
        this.download = this.download.bind(this);
    }

    async upload(req, res) {
        console.log('----InternetFileController.upload');
        try {
            const filename = await this.internetFileService.upload(req, res);
            const fileId = path.basename(filename, path.extname(filename));
            res.status(200).json({ message: 'File uploaded successfully.', fileId: fileId });
        } catch (error) {
            console.error('Error uploading file: ', error);
            res.status(500).json({ message: 'Failed to upload the file.', error: error.message });
        }
    }

    async download(req, res) {
        console.log('----InternetFileController.download');
        // TODO: 實現下載檔案邏輯
        res.status(200).json({ message: 'File download logic not implemented yet' });
    }
}

export default InternetFileController;
