import InternetFileService from '../services/internetFileService.js';
import path from 'path';

import { logWithFileInfo } from '../../logger.js';

class InternetFileController {
    async upload(req, res) {
        logWithFileInfo('info', '----InternetFileController.upload');
        // TODO: 實現上傳檔案邏輯
        res.status(201).json({ message: 'File upload logic not implemented yet' });
    }

    async download(req, res) {
        logWithFileInfo('info', '----InternetFileController.download');
        // TODO: 實現下載檔案邏輯
        res.status(200).json({ message: 'File download logic not implemented yet' });
    }
}

export default InternetFileController;
