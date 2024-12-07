import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';
import { logWithFileInfo } from '../../logger.js';
import S3Service from './s3Service.js';

class InternetFileService {
    constructor() {
        // 產生唯一的檔案名稱
        const _generateUniqueFilename = (filename) => {
            const extension = path.extname(filename);
            const originalName = path.basename(filename, extension);
            return `${uuidv4()}_${originalName}${extension}`; // 檔案格式：uuid_原檔名.附檔名
        };

        const __filename = fileURLToPath(import.meta.url); // 當前檔名
        const __dirname = path.dirname(__filename); // 當前目錄名
        const uploadPath = path.join(__dirname, '../../uploads');

        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, uploadPath);
            },
            filename: function (req, file, cb) {
                cb(null, _generateUniqueFilename(file.originalname));
            },
        });

        this.uploader = multer({
            storage: storage, // 設定檔案儲存位置與檔名
            limits: { fileSize: 5 * 1024 * 1024 }, // 設定檔案大小限制為 5 MB
        });
    }

    // 使用 multer middleware 協助上傳
    getUploadMiddleware = () => {
        return this.uploader.single('uploadFile'); // 'uploadFile' 是前端 input 的 name 属性
    };

    _localDownload = async (filePath) => {
        const fileHandle = await fs.promises.open(filePath, 'r');
        const filestream = fs.createReadStream(null, { fd: fileHandle.fd, autoClose: true });
        return { stream: filestream, filename: path.basename(filePath) };
    };

    _stagingAreaDownload = async (filePath, filename, userId) => {
        const s3Service = new S3Service();
        const file = {
            tempFilePath: filePath,
            name: filename,
        };
        const uploadResult = await s3Service.uploadFile(file, filename, 'user', userId);
        return { filename: uploadResult.filename, url: uploadResult.location };
    };

    download = async (req, res) => {
        const userId = req.params.userId;
        const way = req.params.way;
        const fileId = req.params.fileId;

        const __filename = fileURLToPath(import.meta.url); // current filename
        const __dirname = path.dirname(__filename); // current directory name
        const rootPath = path.join(__dirname, '../../uploads');
        const files = await fs.promises.readdir(rootPath);
        const matchedFile = files.find((file) => path.basename(file, path.extname(file)) === fileId);
        if (!matchedFile) {
            throw new Error('File not found');
        }
        const filePath = path.join(rootPath, matchedFile);

        // 根據不同 ways 提供不同下載方式
        if (way === 'local') {
            return this._localDownload(filePath);
        } else if (way === 'staging-area') {
            return this._stagingAreaDownload(filePath, matchedFile, userId);
        } else if (way === 'google-cloud') {
            // TODO: Integrate Google drive
        } else {
            throw new Error('Invalid download way.');
        }
    };

    deleteFile = async (req, res) => {
        const fileId = req.params.fileId;
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const rootPath = path.join(__dirname, '../../uploads');

        const files = await fs.promises.readdir(rootPath);
        const matchedFile = files.find((file) => path.basename(file, path.extname(file)) === fileId);
        // 沒有匹配的檔案
        if (!matchedFile) {
            throw new Error('File not found');
        }

        const filePath = path.join(rootPath, matchedFile);
        await fs.promises.unlink(filePath); // 刪除檔案
        res.send({ message: 'File deleted successfully' });
    };
}

export default InternetFileService;
