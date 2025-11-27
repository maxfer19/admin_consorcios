import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}

  async sendFriendRequest(initiatorId: string, receiverId: string) {
    if (initiatorId === receiverId) {
      throw new BadRequestException('Cannot send friend request to yourself');
    }

    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { initiatorId, receiverId },
          { initiatorId: receiverId, receiverId: initiatorId },
        ],
      },
    });

    if (existing) {
      throw new BadRequestException('Friend request already exists');
    }

    return this.prisma.friendship.create({
      data: {
        initiatorId,
        receiverId,
      },
      include: {
        receiver: {
          select: { id: true, profile: true },
        },
      },
    });
  }

  async acceptFriendRequest(friendshipId: string, userId: string) {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      throw new NotFoundException('Friend request not found');
    }

    if (friendship.receiverId !== userId) {
      throw new BadRequestException('You can only accept requests sent to you');
    }

    return this.prisma.friendship.update({
      where: { id: friendshipId },
      data: {
        isAccepted: true,
        acceptedAt: new Date(),
      },
    });
  }

  async getFriends(userId: string) {
    return this.prisma.friendship.findMany({
      where: {
        OR: [{ initiatorId: userId }, { receiverId: userId }],
        isAccepted: true,
      },
      include: {
        initiator: { select: { id: true, profile: true } },
        receiver: { select: { id: true, profile: true } },
      },
    });
  }
}
