import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class CreateCourtDto {
  @ApiProperty({ example: 'Club Los Aromos' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Cancha de pádel techada con iluminación LED', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Av. Libertador 1234, CABA' })
  @IsString()
  address: string;

  @ApiProperty({ example: -34.603722, required: false })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ example: -58.381592, required: false })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiProperty({ example: ['https://example.com/photo1.jpg'], required: false })
  @IsArray()
  @IsOptional()
  photos?: string[];

  @ApiProperty({
    example: ['Iluminación LED', 'Estacionamiento', 'Vestuarios', 'Duchas', 'Cafetería'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  amenities?: string[];

  @ApiProperty({ example: 5000 })
  @IsNumber()
  pricePerHour: number;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
