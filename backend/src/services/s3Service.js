import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config(); // import .env variable

class S3Service {
    constructor() {
        this._s3 = new S3Client({
            region: process.env.S3_BUCKET_REGION,
            Credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
        this._bucket = process.env.BUCKET_NAME;
    }

    _generateS3Key = (type, id, filename) => {
        if (type === "user") {
            return `user/${id}/${filename}`;
        } else if (type === "room") {
            return `room/${id}/${filename}`;
        } else {
            throw new Error(`[S3Service] Invalid type: ${type}`);
        }
    };

    uploadFile = async (file, filename, type, id) => {
        console.log(`[S3Service] uploadFile() called with type: ${type}, id: ${id}, filename: ${filename}`);

        const key = this._generateS3Key(type, id, filename); // S3 file key

        // 驗證檔案是否存在
        if (!fs.existsSync(file.tempFilePath)) {
            throw new Error(`[S3Service] File not found: ${file.tempFilePath}`);
        }

        // create readable stream
        const fileStream = fs.createReadStream(file.tempFilePath);
        

        // s3 上傳參數
        const uploadParams = {
            Bucket: this._bucket,
            Key: key,
            Body: fileStream,
            Metadata: {
                originalName: file.name, // let metadata is origin file name
            },
        };

        try {
            const data = await this._s3.send(new PutObjectCommand(uploadParams));
            console.log("[S3Service] Upload Success:", data);
            return {
                filename,
                location: `https://${this._bucket}.s3.${process.env.S3_BUCKET_REGION}.amazonaws.com/${key}`,
            };
        } catch (err) {
            console.error("[S3Service] Upload Failed:", err.message);
            throw err;
        }
    }
}

export default S3Service;