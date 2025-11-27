import { Controller, Get, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PlayerLevel } from '@prisma/client';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users with optional filters' })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'level', required: false, enum: PlayerLevel })
  @ApiQuery({ name: 'city', required: false })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAll(
    @Query('role') role?: string,
    @Query('level') level?: PlayerLevel,
    @Query('city') city?: string,
  ) {
    return this.usersService.findAll({ role, level, city });
  }

  @Get('search')
  @ApiOperation({ summary: 'Search players with filters' })
  @ApiQuery({ name: 'level', required: false, enum: PlayerLevel })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'zone', required: false })
  @ApiQuery({ name: 'minRating', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Players found' })
  async searchPlayers(
    @Query('level') level?: PlayerLevel,
    @Query('city') city?: string,
    @Query('zone') zone?: string,
    @Query('minRating') minRating?: string,
  ) {
    return this.usersService.searchPlayers({
      level,
      city,
      zone,
      minRating: minRating ? parseFloat(minRating) : undefined,
    });
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getMyProfile(@CurrentUser('id') userId: string) {
    return this.usersService.findOne(userId);
  }

  @Get('me/stats')
  @ApiOperation({ summary: 'Get current user stats' })
  @ApiResponse({ status: 200, description: 'Stats retrieved successfully' })
  async getMyStats(@CurrentUser('id') userId: string) {
    return this.usersService.getPlayerStats(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get user stats by ID' })
  @ApiResponse({ status: 200, description: 'Stats retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getPlayerStats(@Param('id') id: string) {
    return this.usersService.getPlayerStats(id);
  }

  @Put('me/profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateMyProfile(
    @CurrentUser('id') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, updateProfileDto);
  }
}
