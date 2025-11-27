import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsNumber, IsOptional } from 'class-validator';

export class CreateTimeSlotDto {
  @ApiProperty({ example: 'uuid-court-id' })
  @IsString()
  courtId: string;

  @ApiProperty({ example: '2025-12-01T18:00:00Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ example: '2025-12-01T19:30:00Z' })
  @IsDateString()
  endTime: string;

  @ApiProperty({ example: 5000, required: false })
  @IsNumber()
  @IsOptional()
  price?: number;
}
