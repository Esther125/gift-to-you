import InternetFileService from '../services/internetFileService.js';
import path from 'path';

class InternetFileController {
    constructor() {
        this.internetFileService = new InternetFileService();
    }

    send = async (req, res) => {
        console.log('----InternetFileController.send');
        try {
            const receiverId = await this.internetFileService.send(req, res);
            res.status(200).json({ message: 'File sent successfully.', receiverId: receiverId });
        } catch (error) {
            console.log('Error sending file:', error);
            res.status(500).json({ message: 'Failed to send the file.', error: error.message });
        }
    };

    upload = async (req, res) => {
        console.log('----InternetFileController.upload');
        try {
            const filename = await this.internetFileService.upload(req, res);
            const fileId = path.basename(filename, path.extname(filename));
            res.status(200).json({ message: 'File uploaded successfully.', fileId: fileId });
        } catch (error) {
            console.error('Error uploading file: ', error);
            res.status(500).json({ message: 'Failed to upload the file.', error: error.message });
        }
    };

    download = async (req, res) => {
        console.log('----InternetFileController.download');
        try {
            await this.internetFileService.download(req, res);
            console.info('File donwloaded successfully.');
        } catch (error) {
            console.error('Error downloading file: ', error);
            res.status(500).json({ message: 'Failed to download the file.', error: error.message });
        }
    };
}

export default InternetFileController;
