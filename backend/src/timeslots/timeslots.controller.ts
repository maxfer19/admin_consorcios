import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TimeslotsService } from './timeslots.service';
import { CreateTimeSlotDto } from './dto/create-timeslot.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('timeslots')
@Controller('timeslots')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TimeslotsController {
  constructor(private timeslotsService: TimeslotsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new time slot (Court Owner only)' })
  @ApiResponse({ status: 201, description: 'Time slot created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Body() createTimeSlotDto: CreateTimeSlotDto,
  ) {
    return this.timeslotsService.create(userId, createTimeSlotDto, userRole);
  }

  @Get()
  @ApiOperation({ summary: 'Get all time slots with filters' })
  @ApiQuery({ name: 'courtId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'isAvailable', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Time slots retrieved successfully' })
  async findAll(
    @Query('courtId') courtId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('isAvailable') isAvailable?: string,
  ) {
    return this.timeslotsService.findAll({
      courtId,
      startDate,
      endDate,
      isAvailable: isAvailable ? isAvailable === 'true' : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get time slot by ID' })
  @ApiResponse({ status: 200, description: 'Time slot found' })
  @ApiResponse({ status: 404, description: 'Time slot not found' })
  async findOne(@Param('id') id: string) {
    return this.timeslotsService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete time slot (Owner only)' })
  @ApiResponse({ status: 200, description: 'Time slot deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Time slot not found' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.timeslotsService.remove(id, userId, userRole);
  }
}
