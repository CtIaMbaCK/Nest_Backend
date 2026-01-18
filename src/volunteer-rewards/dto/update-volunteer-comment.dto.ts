import { PartialType } from '@nestjs/swagger';
import { CreateVolunteerCommentDto } from './create-volunteer-comment.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateVolunteerCommentDto extends PartialType(
  OmitType(CreateVolunteerCommentDto, ['volunteerId'] as const),
) {}
