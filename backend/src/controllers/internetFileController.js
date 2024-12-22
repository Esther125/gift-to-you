import InternetFileService from '../services/internetFileService.js';
import { logWithFileInfo } from '../../logger.js';

class InternetFileController {
    constructor() {
        this.internetFileService = new InternetFileService();
    }

    upload = async (req, res) => {
        logWithFileInfo('info', '----InternetFileController.upload');
        try {
            const uploadResult = await this.internetFileService.uploadFile(req, res);
            res.status(200).json({
                message: 'File uploaded successfully.',
                fileId: uploadResult.fileId,
                fileName: uploadResult.fileName, // 使用者上傳的原始檔名
            });
        } catch (error) {
            logWithFileInfo('error', 'Error uploading file.', error);
            res.status(500).json({ message: 'Failed to upload the file.', error: error.message });
        }
    };

    download = async (req, res) => {
        logWithFileInfo('info', '----InternetFileController.download');
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
            logWithFileInfo('info', 'File downloaded successfully.');
        } catch (error) {
            logWithFileInfo('error', 'Error downloading file.', error);
            res.status(500).json({ message: 'Failed to download the file.', error: error.message });
        }
    };

    deleteFile = async (req, res) => {
        logWithFileInfo('info', '----InternetFileController.deleteFile');
        try {
            const response = await this.internetFileService.deleteFile(req, res);
            res.send(response);
            logWithFileInfo('info', 'File deleted successfully.');
        } catch (error) {
            logWithFileInfo('error', 'Error deleting file. ', error);
            const errorMsg = { message: 'Failed to delete the file', error: error.message };
            if (error.message === 'File not found') {
                res.status(404).send(errorMsg);
            } else {
                res.status(500).send(errorMsg);
            }
        }
    };

    deleteAllFiles = async (req, res) => {
        logWithFileInfo('info', '----InternetFileController.deleteAllFiles');
        try {
            const response = await this.internetFileService.deleteAllFiles();
            logWithFileInfo('info', 'All files deleted successfully.');
            res.send(response);
        } catch (error) {
            logWithFileInfo('error', 'Error deleting all the files.', error);
            res.status(500).send({ message: 'Failed to delete all the files.', error: error.message });
        }
    };
}

export default InternetFileController;
