import S3Service from "../services/s3Service.js";
import { logWithFileInfo } from '../../logger.js';

class ProfileController {
    constructor() {
        this.s3Service = new S3Service();
    }

    // 暫存檔案查詢
    getStagingFile = async (req, res) => {
        logWithFileInfo('info', '----ProfileController.getStagingFile');

        const { userId, lastKey} = req.body;

        try {
            const { files, lastKey: nextLastKey } = await this.s3Service.getFileList(userId, lastKey);

            if (files.length === 0) {
                return res.status(404).json({ message: 'No files found for this user.' });
            }
            
            return res.status(200).json({ 
                file: files,
                lastKey: nextLastKey,
             });
        } catch (error) {
            logWithFileInfo('error', 'Error fetching staging file:', error.message);
            return res.status(500).json({ message: 'Failed to fetch staging files.', error: error.message });
        }
    }
}

export default ProfileController;
