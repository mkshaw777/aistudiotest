import { toast } from 'sonner';
import { IMAGE_COMPRESSION_QUALITY, IMAGE_MAX_DIMENSION, IMAGE_MAX_SIZE_MB } from './constants';

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as Base64.'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(''); // No file, no compression needed, resolve with empty string
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        let width = img.width;
        let height = img.height;
        const maxSize = IMAGE_MAX_DIMENSION;

        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', IMAGE_COMPRESSION_QUALITY);

        resolve(compressed);
      };

      img.onerror = reject;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const validateImageFile = (file: File | null): boolean => {
  if (!file) return true; // No file is valid (optional upload)

  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  const maxSize = IMAGE_MAX_SIZE_MB * 1024 * 1024; // 5MB in bytes

  if (!allowedTypes.includes(file.type)) {
    toast.error('Invalid file type. Only JPG and PNG are allowed.');
    return false;
  }

  if (file.size > maxSize) {
    toast.error(`File size exceeds ${IMAGE_MAX_SIZE_MB}MB limit.`);
    return false;
  }

  return true;
};
