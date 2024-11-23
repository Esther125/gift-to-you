import S3Service from "../../services/s3Service.js"; 
import path from "path";

const testUpload = async () => {
    const s3Service = new S3Service();

    const mockFile = {
        tempFilePath: "src/tests/s3/tmp/test.txt", 
        name: "test.txt", 
    };

    const mockFilename = "unique-test-file.txt"; // 上傳到 S3 的檔案名稱
    const mockUserId = "12345";                 // 模擬使用者 ID

    try {
        const result = await s3Service.uploadFile(mockFile, mockFilename, mockUserId);
        console.log("Upload Success:", result);
    } catch (error) {
        console.error("Upload Failed:", error.message);
    }
};

testUpload();
