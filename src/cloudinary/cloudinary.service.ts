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
}
