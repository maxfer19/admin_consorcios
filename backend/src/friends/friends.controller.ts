import { Controller, Get, Post, Param, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('friends')
@Controller('friends')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FriendsController {
  constructor(private friendsService: FriendsService) {}

  @Post('request')
  async sendRequest(@CurrentUser('id') userId: string, @Body('receiverId') receiverId: string) {
    return this.friendsService.sendFriendRequest(userId, receiverId);
  }

  @Post(':id/accept')
  async accept(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.friendsService.acceptFriendRequest(id, userId);
  }

  @Get()
  async getFriends(@CurrentUser('id') userId: string) {
    return this.friendsService.getFriends(userId);
  }
}
