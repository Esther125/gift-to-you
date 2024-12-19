import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';
import S3Service from './s3Service.js';
import redisClient from '../clients/redisClient.js';
import { logWithFileInfo } from '../../logger.js';
import pkg from 'bloom-filters';
const { CountingBloomFilter } = pkg;
import dotenv from 'dotenv';

class InternetFileService {
    constructor() {
        dotenv.config();
        this.__filename = fileURLToPath(import.meta.url); // 當前檔名
        this.__dirname = path.dirname(this.__filename); // 當前目錄名
        this.uploadPath = path.join(this.__dirname, '../../uploads');
        this.bloomFilter = new CountingBloomFilter.create(
            process.env.BLOOM_FILTER_ESTIMATED_FILE_COUNT,
            process.env.BLOOM_FILTER_ERROR_RATE
        );
    }

    _generateUniqueFilename = (filename, file) => {
        const extension = path.extname(filename);
        const originalName = path.basename(filename, extension);
        const fileId = this._calculateFileHash(file); // 把 fileHash 當成 fileId
        return `${fileId}_${originalName}${extension}`; // 檔案格式：{fileId}_{原檔名}.{附檔名}
    };

    _calculateFileHash = (file) => {
        const hash = crypto.createHash('sha256');
        hash.update(file);
        return hash.digest('hex');
    };

    uploadFile = async (req, res, next) => {
        try {
            if (!req.file) {
                throw new Error('No file was uploaded.');
            }

            const fileBuffer = req.file.buffer; // 暫存在 memory 中的檔案
            const originalFilename = req.file.originalname;
            const exist = this.bloomFilter.has(fileBuffer);
            let fullFilename;

            if (exist) {
                fullFilename = this._generateUniqueFilename(originalFilename, fileBuffer);
                logWithFileInfo('info', `File: ${fullFilename} already exists in the server.`);
            } else {
                fullFilename = this._generateUniqueFilename(originalFilename, fileBuffer);
                // 將檔案存入 uploads 資料夾
                const filePath = path.join(this.uploadPath, fullFilename);
                await fs.promises.writeFile(filePath, fileBuffer);
                // 將 file 加到 bloomFilter
                this.bloomFilter.add(fileBuffer);
                logWithFileInfo('info', `File saved as ${fullFilename}`);
            }
            return fullFilename;
            // TODO: 不用 Redis 以後要怎麼定時刪掉 filehashs
        } catch (err) {
            throw new Error(err);
        }
    };

    _localDownload = async (filePath) => {
        let fileHandle = null;
        fileHandle = await fs.promises.open(filePath, 'r');
        const filestream = fs.createReadStream(filePath, { fd: fileHandle.fd, autoClose: false });
        return { stream: filestream, filename: path.basename(filePath) };
    };

    _stagingAreaDownload = async (type, filePath, filename, id) => {
        const s3Service = new S3Service();
        const file = {
            tempFilePath: filePath,
            name: filename,
        };
        const uploadResult = await s3Service.uploadFile(file, filename, type, id);
        const [fileId, encodedFilename] = uploadResult.filename.split('_');
        const originalFilename = decodeURIComponent(encodedFilename);
        return { fileId: fileId, filename: originalFilename, location: uploadResult.location };
    };

    download = async (req, res) => {
        const way = req.params.way;
        const fileId = req.params.fileId;
        const { type, id } = req.query;

        const files = await fs.promises.readdir(this.uploadPath);
        const matchedFile = files.find((file) => file.startsWith(fileId + '_')); // 只比對檔名前面的 fileId
        if (!matchedFile) {
            throw new Error('File not found');
        }
        const safeFileName = encodeURIComponent(matchedFile);
        const filePath = path.join(this.uploadPath, matchedFile);

        // 根據不同 ways 提供不同下載方式
        if (way === 'local') {
            return this._localDownload(filePath);
        } else if (way === 'staging-area') {
            if (!type || !id) {
                throw new Error('Type and id query parameters are required for staging-area download.');
            }
            return this._stagingAreaDownload(type, filePath, safeFileName, id);
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
