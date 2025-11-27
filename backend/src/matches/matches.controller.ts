import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PlayerLevel, MatchStatus } from '@prisma/client';

@ApiTags('matches')
@Controller('matches')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MatchesController {
  constructor(private matchesService: MatchesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new match' })
  @ApiResponse({ status: 201, description: 'Match created successfully' })
  async create(@CurrentUser('id') userId: string, @Body() createMatchDto: CreateMatchDto) {
    return this.matchesService.create(userId, createMatchDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all available matches with filters' })
  @ApiQuery({ name: 'level', required: false, enum: PlayerLevel })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'status', required: false, enum: MatchStatus })
  @ApiResponse({ status: 200, description: 'Matches retrieved successfully' })
  async findAll(
    @Query('level') level?: PlayerLevel,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('city') city?: string,
    @Query('status') status?: MatchStatus,
  ) {
    return this.matchesService.findAll({ level, startDate, endDate, city, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get match by ID' })
  @ApiResponse({ status: 200, description: 'Match found' })
  @ApiResponse({ status: 404, description: 'Match not found' })
  async findOne(@Param('id') id: string) {
    return this.matchesService.findOne(id);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join a match' })
  @ApiResponse({ status: 200, description: 'Joined match successfully' })
  @ApiResponse({ status: 400, description: 'No spots available or already joined' })
  async join(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.matchesService.joinMatch(id, userId);
  }

  @Post(':id/leave')
  @ApiOperation({ summary: 'Leave a match' })
  @ApiResponse({ status: 200, description: 'Left match successfully' })
  @ApiResponse({ status: 400, description: 'Not in match or organizer cannot leave' })
  async leave(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.matchesService.leaveMatch(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel match (Organizer only)' })
  @ApiResponse({ status: 200, description: 'Match cancelled successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async cancel(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.matchesService.cancelMatch(id, userId);
  }
}
