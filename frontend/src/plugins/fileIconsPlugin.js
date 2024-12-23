export default {
    install(app) {
        // icon: extension
        const iconCategories = {
            'bi bi-file-earmark-pdf': new Set(['pdf']),
            'bi bi-file-earmark-word': new Set(['doc', 'docx']),
            'bi bi-file-earmark-excel': new Set(['xls', 'xlsx']),
            'bi bi-file-earmark-slides': new Set(['ppt', 'pptx']),
            'bi bi-file-earmark-text': new Set(['txt']),
            'bi bi-file-earmark-image': new Set(['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg']),
            'bi bi-file-earmark-music': new Set(['mp3', 'wav']),
            'bi bi-file-earmark-play': new Set(['mp4', 'avi', 'mov']),
            'bi bi-file-earmark-zip': new Set(['zip', 'rar', '7z']),
            'bi bi-file-earmark-code': new Set(['json', 'js', 'css', 'html', 'py']),
        };

        // 定義一個獲取圖標的函數
        const getFileIcon = (fileName) => {
            if (!fileName || typeof fileName !== 'string') return 'bi bi-file-earmark-text';

            const extension = fileName.split('.').pop().toLowerCase();

            for (const [icon, extensionsSet] of Object.entries(iconCategories)) {
                if (extensionsSet.has(extension)) {
                    return icon;
                }
            }

            return 'bi bi-file-earmark-text'; // Default icon
        };

        // 註冊全局方法
        app.config.globalProperties.$getFileIcon = getFileIcon;
    },
};
