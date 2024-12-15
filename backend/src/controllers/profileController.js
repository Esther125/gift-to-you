import S3Service from "../services/s3Service.js";
import { logWithFileInfo } from '../../logger.js';

class ProfileController {
    constructor() {
        this.s3Service = new S3Service();
    }
    async getStagingFile(req, res) {
        console.log('----ProfileController.getStagingFile');
        // TODO: 實現暫存檔案查詢
        res.status(200).json({ message: 'Get staging file logic not implemented yet' });
    }

    getPresignedUrl = async (req, res) => {
        logWithFileInfo('info', '----ProfileController.generatePresignedUrl');

        const { userId,filename} = req.query;
        const type = "user";

        if (!userId || !filename) {
            logWithFileInfo('error', '[ProfileController] Error when generating presigned URL - filename and id are required');
            return res.status(400).json({ message: 'Filename and userId are required' });
        }

        try {
            const presignedUrl = await this.s3Service.generatePresignedUrl(filename, type, userId);

            return res.status(200).json({
                message: 'Presigned URL generated successfully',
                url: presignedUrl,
            });
        } catch (error) {
            logWithFileInfo('error', '[ProfileController] Error when generating presigned URL', error.message);
            return res.status(500).json({ 
                message: 'Failed to generate presigned URL', 
                error: error.message 
            });
        }
    };  
}

export default ProfileController;
