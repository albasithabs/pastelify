import type { AspectRatioKey } from '../constants';

// Menentukan dimensi target untuk setiap rasio aspek.
// Ini menjaga konsistensi dan mengoptimalkan ukuran untuk API.
const TARGET_DIMENSIONS: Record<AspectRatioKey, { width: number; height: number }> = {
    '4:5': { width: 819, height: 1024 },
    '9:16': { width: 576, height: 1024 },
    '1:1': { width: 1024, height: 1024 },
};

/**
 * Mengubah ukuran gambar base64 ke rasio aspek target dengan melakukan crop-to-fill (cover).
 * Ini memastikan AI menerima input visual dengan rasio yang benar tanpa padding.
 * @param base64Src - String base64 dari gambar sumber.
 * @param targetRatioKey - Kunci rasio aspek target (misalnya, '9:16').
 * @returns {Promise<{ resizedBase64: string, mimeType: string }>} - Objek yang berisi base64 baru dan tipe mime-nya.
 */
export const resizeImageToAspectRatio = (
    base64Src: string,
    targetRatioKey: AspectRatioKey
): Promise<{ resizedBase64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const target = TARGET_DIMENSIONS[targetRatioKey];
            const canvas = document.createElement('canvas');
            canvas.width = target.width;
            canvas.height = target.height;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                return reject(new Error('Tidak dapat membuat context canvas.'));
            }

            // --- LOGIC CHANGE FROM 'FIT' TO 'COVER' ---
            const hRatio = canvas.width / img.width;
            const vRatio = canvas.height / img.height;
            // Gunakan rasio yang lebih BESAR untuk memastikan gambar menutupi seluruh kanvas
            const ratio = Math.max(hRatio, vRatio);

            const newWidth = img.width * ratio;
            const newHeight = img.height * ratio;

            // Pusatkan gambar di kanvas, ini akan memotong (crop) bagian yang berlebih
            const x = (canvas.width - newWidth) / 2;
            const y = (canvas.height - newHeight) / 2;
            
            ctx.drawImage(img, 0, 0, img.width, img.height, x, y, newWidth, newHeight);

            // Kita gunakan JPEG untuk efisiensi ukuran file saat mengirim ke API
            const mimeType = 'image/jpeg';
            const resizedBase64 = canvas.toDataURL(mimeType, 0.9); // Kualitas 90%

            resolve({ resizedBase64, mimeType });
        };
        img.onerror = (err) => {
            console.error("Gagal memuat gambar untuk diubah ukurannya:", err);
            reject(new Error('Gagal memuat gambar untuk diubah ukurannya.'));
        };
        img.src = base64Src;
    });
};

/**
 * Mengubah ukuran gambar agar muat dalam dimensi maksimal (Fit).
 * Cocok untuk Group Shot inputs agar produk tidak terpotong.
 */
export const resizeImageToMaxDimension = (
    base64Src: string,
    maxDimension: number = 1024
): Promise<{ resizedBase64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxDimension) {
                    height *= maxDimension / width;
                    width = maxDimension;
                }
            } else {
                if (height > maxDimension) {
                    width *= maxDimension / height;
                    height = maxDimension;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                return reject(new Error('Tidak dapat membuat context canvas.'));
            }
            
            ctx.drawImage(img, 0, 0, width, height);

            const mimeType = 'image/jpeg';
            const resizedBase64 = canvas.toDataURL(mimeType, 0.85); // Sedikit kompresi untuk performa array

            resolve({ resizedBase64, mimeType });
        };
        img.onerror = (err) => {
            console.error("Gagal memuat gambar untuk resize.", err);
            reject(new Error('Gagal memuat gambar untuk resize.'));
        };
        img.src = base64Src;
    });
};