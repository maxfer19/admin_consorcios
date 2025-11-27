import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CourtsService } from './courts.service';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('courts')
@Controller('courts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CourtsController {
  constructor(private courtsService: CourtsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.COURT_OWNER, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Create a new court (Court Owner only)' })
  @ApiResponse({ status: 201, description: 'Court created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only court owners can create courts' })
  async create(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Body() createCourtDto: CreateCourtDto,
  ) {
    return this.courtsService.create(userId, createCourtDto, userRole);
  }

  @Get()
  @ApiOperation({ summary: 'Get all courts with optional filters' })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Courts retrieved successfully' })
  async findAll(@Query('city') city?: string, @Query('isActive') isActive?: string) {
    return this.courtsService.findAll({
      city,
      isActive: isActive ? isActive === 'true' : undefined,
    });
  }

  @Get('my-courts')
  @ApiOperation({ summary: 'Get my courts (Court Owner)' })
  @ApiResponse({ status: 200, description: 'Courts retrieved successfully' })
  async findMyCourts(@CurrentUser('id') userId: string) {
    return this.courtsService.findMyCourtds(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get court by ID' })
  @ApiResponse({ status: 200, description: 'Court found' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  async findOne(@Param('id') id: string) {
    return this.courtsService.findOne(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get court statistics (Owner only)' })
  @ApiResponse({ status: 200, description: 'Stats retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getStats(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.courtsService.getCourtStats(id, userId, userRole);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update court (Owner only)' })
  @ApiResponse({ status: 200, description: 'Court updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Body() updateCourtDto: UpdateCourtDto,
  ) {
    return this.courtsService.update(id, userId, updateCourtDto, userRole);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete court (Owner only)' })
  @ApiResponse({ status: 200, description: 'Court deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.courtsService.remove(id, userId, userRole);
  }
}
