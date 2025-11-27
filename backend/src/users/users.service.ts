import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PlayerLevel } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: { role?: string; level?: PlayerLevel; city?: string }) {
    const where: any = {};

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.level || filters?.city) {
      where.profile = {};
      if (filters.level) {
        where.profile.level = filters.level;
      }
      if (filters.city) {
        where.profile.city = filters.city;
      }
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        profile: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedProfile = await this.prisma.profile.update({
      where: { userId },
      data: updateProfileDto,
    });

    return updatedProfile;
  }

  async searchPlayers(query: {
    level?: PlayerLevel;
    city?: string;
    zone?: string;
    minRating?: number;
  }) {
    const where: any = {
      role: 'PLAYER',
      isActive: true,
    };

    const profileWhere: any = {};

    if (query.level) {
      profileWhere.level = query.level;
    }

    if (query.city) {
      profileWhere.city = query.city;
    }

    if (query.zone) {
      profileWhere.preferredZones = {
        has: query.zone,
      };
    }

    if (query.minRating) {
      profileWhere.rating = {
        gte: query.minRating,
      };
    }

    if (Object.keys(profileWhere).length > 0) {
      where.profile = profileWhere;
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        profile: true,
      },
    });
  }

  async getPlayerStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        matchPlayers: {
          include: {
            match: {
              include: {
                timeSlot: {
                  include: {
                    court: true,
                  },
                },
              },
            },
          },
        },
        reviewsReceived: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const completedMatches = user.matchPlayers.filter(
      (mp) => mp.match.status === 'COMPLETED',
    ).length;

    const avgRating =
      user.reviewsReceived.length > 0
        ? user.reviewsReceived.reduce((acc, r) => acc + r.rating, 0) /
          user.reviewsReceived.length
        : 0;

    return {
      userId: user.id,
      profile: user.profile,
      stats: {
        matchesPlayed: completedMatches,
        matchesCancelled: user.profile.matchesCancelled,
        noAckCount: user.profile.noAckCount,
        rating: user.profile.rating,
        averageReviewRating: avgRating,
        totalReviews: user.reviewsReceived.length,
      },
    };
  }
}
