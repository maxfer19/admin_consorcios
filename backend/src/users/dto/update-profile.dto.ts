import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString, IsArray } from 'class-validator';
import { PlayerLevel, Hand, PreferredPosition } from '@prisma/client';

export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiProperty({ enum: PlayerLevel, required: false })
  @IsEnum(PlayerLevel)
  @IsOptional()
  level?: PlayerLevel;

  @ApiProperty({ enum: Hand, required: false })
  @IsEnum(Hand)
  @IsOptional()
  hand?: Hand;

  @ApiProperty({ enum: PreferredPosition, required: false })
  @IsEnum(PreferredPosition)
  @IsOptional()
  preferredPosition?: PreferredPosition;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsOptional()
  preferredZones?: string[];
}
