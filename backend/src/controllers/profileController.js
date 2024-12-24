import S3Service from '../services/s3Service.js';
import { logWithFileInfo } from '../../logger.js';

class ProfileController {
    constructor() {
        this.s3Service = new S3Service();
    }

    // 暫存檔案查詢
    getStagingFile = async (req, res) => {
        logWithFileInfo('info', '----ProfileController.getStagingFile');

        const { type, id, lastKey } = req.query;

        if (!type || !id) {
            return res.status(400).json({ message: 'Type and ID are required.' });
        }

        try {
            const { files, lastKey: nextLastKey, totalFilesCount} = await this.s3Service.getFileList(type, id, lastKey);

            if (files.length === 0) {
                return res.status(200).json({ 
                    file: [],
                    lastKey: null,
                    totalFilesCount: 0,
                    message: 'No files found' 
                });
            }

            return res.status(200).json({
                file: files,
                lastKey: nextLastKey,
                totalFilesCount: totalFilesCount,
            });
        } catch (error) {
            logWithFileInfo('error', 'Error fetching staging file:', error);
            return res.status(500).json({ message: 'Failed to fetch staging files.', error: error.message });
        }
    };

    getPresignedUrl = async (req, res) => {
        logWithFileInfo('info', '----ProfileController.generatePresignedUrl');

        const { userId, filename } = req.query;
        const type = 'user';

        if (!userId || !filename) {
            logWithFileInfo(
                'error',
                'Error when generating presigned URL - filename and id are required',
                new Error('Argument is needed but missing')
            );
            return res.status(400).json({ message: 'Filename and userId are required' });
        }

        try {
            const presignedUrl = await this.s3Service.generatePresignedUrl(filename, type, userId);

            return res.status(200).json({
                message: 'Presigned URL generated successfully',
                url: presignedUrl,
            });
        } catch (error) {
            logWithFileInfo('error', 'Error when generating presigned URL', error);
            return res.status(500).json({
                message: 'Failed to generate presigned URL',
                error: error.message,
            });
        }
    };
}

export default ProfileController;
