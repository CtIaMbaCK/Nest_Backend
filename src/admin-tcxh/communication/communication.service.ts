import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CreatePostDto, UpdatePostDto, FilterPostDto } from './dto';
import { Role } from 'src/generated/prisma/enums';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

@Injectable()
export class CommunicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  // Helper: Kiểm tra TCXH tồn tại
  private async getOrgOrThrow(organizationId: string) {
    const org = await this.prisma.user.findUnique({
      where: { id: organizationId, role: Role.ORGANIZATION },
    });

    if (!org) {
      throw new NotFoundException('Không tìm thấy tổ chức');
    }

    return org;
  }

  // === API CHO TCXH ===

  // Tạo bài viết mới
  async createPost(
    organizationId: string,
    dto: CreatePostDto,
    coverImageFile?: Express.Multer.File,
  ) {
    await this.getOrgOrThrow(organizationId);

    let coverImageUrl: string | undefined;

    if (coverImageFile) {
      coverImageUrl = await this.cloudinary.uploadFile(coverImageFile);
    }

    return this.prisma.communicationPost.create({
      data: {
        organizationId,
        title: dto.title,
        content: dto.content,
        coverImage: coverImageUrl,
      },
      include: {
        organization: {
          select: {
            id: true,
            email: true,
            organizationProfiles: {
              select: {
                organizationName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  // Lấy danh sách bài viết của TCXH
  async getOrgPosts(organizationId: string, dto: FilterPostDto) {
    await this.getOrgOrThrow(organizationId);

    const { search, page = 1, limit = 10 } = dto;

    const where: any = {
      organizationId,
    };

    // Tìm kiếm theo từ khóa
    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { content: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.communicationPost.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          organization: {
            select: {
              id: true,
              organizationProfiles: {
                select: {
                  organizationName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.communicationPost.count({ where }),
    ]);

    return { data, meta: { total, page, limit } };
  }

  // Xem chi tiết bài viết
  async getPostDetail(postId: string, organizationId?: string) {
    const post = await this.prisma.communicationPost.findUnique({
      where: { id: postId },
      include: {
        organization: {
          select: {
            id: true,
            email: true,
            organizationProfiles: {
              select: {
                organizationName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }

    // Nếu có organizationId, kiểm tra quyền sở hữu
    if (organizationId && post.organizationId !== organizationId) {
      throw new ForbiddenException('Bạn không có quyền xem bài viết này');
    }

    return post;
  }

  // Cập nhật bài viết
  async updatePost(
    postId: string,
    organizationId: string,
    dto: UpdatePostDto,
    coverImageFile?: Express.Multer.File,
  ) {
    await this.getOrgOrThrow(organizationId);

    const post = await this.prisma.communicationPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }

    if (post.organizationId !== organizationId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa bài viết này');
    }

    let coverImageUrl: string | undefined;

    if (coverImageFile) {
      coverImageUrl = await this.cloudinary.uploadFile(coverImageFile);
    }

    return this.prisma.communicationPost.update({
      where: { id: postId },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.content && { content: dto.content }),
        ...(coverImageUrl && { coverImage: coverImageUrl }),
      },
      include: {
        organization: {
          select: {
            id: true,
            organizationProfiles: {
              select: {
                organizationName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  // Xóa bài viết (TCXH)
  async deletePost(postId: string, organizationId: string) {
    const post = await this.prisma.communicationPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }

    if (post.organizationId !== organizationId) {
      throw new ForbiddenException('Bạn không có quyền xóa bài viết này');
    }

    await this.prisma.communicationPost.delete({
      where: { id: postId },
    });

    return { message: 'Xóa bài viết thành công' };
  }

  // Xóa bài viết (Admin)
  async deletePostAsAdmin(postId: string, adminId: string) {
    // Kiểm tra admin
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || admin.role !== Role.ADMIN) {
      throw new ForbiddenException('Chỉ Admin mới có quyền xóa bài viết này');
    }

    const post = await this.prisma.communicationPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }

    await this.prisma.communicationPost.delete({
      where: { id: postId },
    });

    return { message: 'Admin đã xóa bài viết thành công' };
  }

  // === PUBLIC API ===

  // Lấy tất cả bài viết (public)
  async getAllPosts(dto: FilterPostDto) {
    const { search, page = 1, limit = 10 } = dto;

    const where: any = {};

    // Tìm kiếm theo từ khóa
    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { content: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.communicationPost.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          organization: {
            select: {
              id: true,
              organizationProfiles: {
                select: {
                  organizationName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.communicationPost.count({ where }),
    ]);

    return { data, meta: { total, page, limit } };
  }

  // Xem chi tiết bài viết (public)
  async getPublicPostDetail(postId: string) {
    const post = await this.prisma.communicationPost.findUnique({
      where: { id: postId },
      include: {
        organization: {
          select: {
            id: true,
            organizationProfiles: {
              select: {
                organizationName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }

    return post;
  }
}
