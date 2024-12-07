import InternetFileService from '../services/internetFileService.js';
import path from 'path';

import { logWithFileInfo } from '../../logger.js';

class InternetFileController {
    constructor() {
        this.internetFileService = new InternetFileService();
    }

    upload = async (req, res) => {
        logWithFileInfo('info', '----InternetFileController.upload');
        try {
            if (!req.file) {
                throw new Error('No file was uploaded.');
            }
            const fullFilename = req.file.filename; // 從 multer middleware 抓文件名
            const [fileId, fileName] = fullFilename.split('_');
            res.status(200).json({
                message: 'File uploaded successfully.',
                fileId: fileId,
                fileName: fileName,
            });
        } catch (error) {
            logWithFileInfo('info', '----InternetFileController.download');
            res.status(500).json({ message: 'Failed to upload the file.', error: error.message });
        }
    };

    download = async (req, res) => {
        console.log('----InternetFileController.download');
        try {
            const downloadDetails = await this.internetFileService.download(req);
            if (downloadDetails.stream) {
                const encodedFilename = encodeURIComponent(downloadDetails.filename);
                res.setHeader('Content-Disposition', `attachment; filename="${encodedFilename}"`);
                res.setHeader('Content-Type', 'application/octet-stream');
                downloadDetails.stream.pipe(res);
            } else {
                res.json(downloadDetails);
            }
            console.info('File downloaded successfully.');
        } catch (error) {
            console.error('Error downloading file: ', error);
            res.status(500).json({ message: 'Failed to download the file.', error: error.message });
        }
    };

    deleteFile = async (req, res) => {
        console.log('----InternetFileController.deleteFile');
        try {
            await this.internetFileService.deleteFile(req, res);
            console.info('File deleted successfully.');
        } catch (error) {
            console.error('Error deleting file: ', error);
            const errorMsg = { message: 'Failed to delete the file', error: error.message };
            if (error.message === 'File not found') {
                res.status(404).send(errorMsg);
            } else {
                res.status(500).send(errorMsg);
            }
        }
    };
}

export default InternetFileController;
