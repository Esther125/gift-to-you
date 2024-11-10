import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

class InternetFileService {
    _generateUniqueFilename(originalName) {
        // 產生一個包含唯一識別碼(uuid)的檔案名稱
        const extension = path.extname(originalName); // 副檔名
        const originalNameWithoutExt = path.basename(originalName, extension);
        return `${originalNameWithoutExt}-${uuidv4()}${extension}`;
    }

    async upload(req, res) {
        // 實現上傳檔案邏輯
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }

        const uploadFile = req.files.uploadFile;

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const rootPath = path.join(__dirname, '../../'); // 把檔案存在 /backend 資料夾下

        const filename = this._generateUniqueFilename(uploadFile.name);
        const uploadPath = path.join(rootPath, '/uploads/', filename);

        // 把檔案存到指定路徑下
        return new Promise((resolve, reject) => {
            uploadFile.mv(uploadPath, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(uploadPath);
                }
            });
        });
    }
}

export default InternetFileService;
