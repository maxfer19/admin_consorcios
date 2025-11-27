import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { PlayerLevel } from '@prisma/client';

export class CreateMatchDto {
  @ApiProperty({ example: 'uuid-timeslot-id' })
  @IsString()
  timeSlotId: string;

  @ApiProperty({ example: 3, description: 'Number of available spots (1, 2, or 3)' })
  @IsNumber()
  @Min(1)
  @Max(3)
  spotsAvailable: number;

  @ApiProperty({ enum: PlayerLevel, required: false })
  @IsEnum(PlayerLevel)
  @IsOptional()
  requiredLevel?: PlayerLevel;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
