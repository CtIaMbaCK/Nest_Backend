import { Injectable } from '@nestjs/common';

import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  async uploadFile(
    file: Express.Multer.File,
    folder?: string,
    options?: { format?: string },
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder || 'better-us',
          timeout: 60000,
          // Force format nếu được chỉ định (dùng cho certificate templates)
          ...(options?.format && { format: options.format }),
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error)
            return reject(new Error(error.message || 'Cloudinary loi'));

          if (!result) return reject(new Error('ko up hinh anh dc '));

          resolve(result.secure_url);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadFiles(files: Express.Multer.File[]): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }

  /**
   * Upload PDF từ Buffer lên Cloudinary
   */
  // Tạm thời chưa dùng đến
  async uploadPDF(
    buffer: Buffer,
    fileName: string,
    folder?: string,
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      // Đảm bảo fileName có extension .pdf
      const fileNameWithExt = fileName.endsWith('.pdf')
        ? fileName
        : `${fileName}.pdf`;

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder || 'certificates',
          resource_type: 'raw', // Quan trọng: phải là 'raw' để upload PDF
          public_id: fileNameWithExt,
          timeout: 120000, // Tăng timeout lên 2 phút để tạo PDF
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error)
            return reject(
              new Error(error.message || 'Lỗi khi upload PDF lên Cloudinary'),
            );

          if (!result)
            return reject(new Error('Không thể upload PDF lên Cloudinary'));

          resolve(result.secure_url);
        },
      );

      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }

  /**
   * Upload ảnh PNG từ Buffer lên Cloudinary
   */
  async uploadImageBuffer(
    buffer: Buffer,
    fileName: string,
    folder?: string,
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder || 'certificates',
          resource_type: 'image',
          format: 'png',
          public_id: fileName,
          timeout: 120000,
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error)
            return reject(
              new Error(error.message || 'Lỗi khi upload ảnh lên Cloudinary'),
            );

          if (!result)
            return reject(new Error('Không thể upload ảnh lên Cloudinary'));

          resolve(result.secure_url);
        },
      );

      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }

  /**
   * Xóa file trên Cloudinary bằng URL
   * @param fileUrl URL đầy đủ của file trên Cloudinary
   * @returns Promise<void>
   */
  async deleteFile(fileUrl: string): Promise<void> {
    if (!fileUrl) return;

    try {
      // Extract public_id từ URL
      // VD: https://res.cloudinary.com/demo/image/upload/v1234567890/better-us/avatar.jpg
      // => public_id: better-us/avatar
      const urlParts = fileUrl.split('/');
      const uploadIndex = urlParts.findIndex((part) => part === 'upload');

      if (uploadIndex === -1 || uploadIndex + 2 >= urlParts.length) {
        console.warn('Invalid Cloudinary URL format:', fileUrl);
        return;
      }

      // Lấy phần sau 'upload/v1234567890/' => 'better-us/avatar.jpg'
      const pathAfterVersion = urlParts.slice(uploadIndex + 2).join('/');

      // Bỏ extension (.jpg, .png, etc.) để lấy public_id
      const public_id = pathAfterVersion.replace(/\.[^/.]+$/, '');

      // Xóa file trên Cloudinary
      await cloudinary.uploader.destroy(public_id);
      console.log(`✅ Đã xóa file trên Cloudinary: ${public_id}`);
    } catch (error) {
      console.error('❌ Lỗi khi xóa file trên Cloudinary:', error);
      // Không throw error để tránh gián đoạn quá trình update
    }
  }

  /**
   * Xóa nhiều files trên Cloudinary
   * @param fileUrls Mảng các URLs cần xóa
   */
  async deleteFiles(fileUrls: string[]): Promise<void> {
    if (!fileUrls || fileUrls.length === 0) return;

    const deletePromises = fileUrls.map((url) => this.deleteFile(url));
    await Promise.all(deletePromises);
  }
}
