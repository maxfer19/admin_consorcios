import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class CourtsService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, createCourtDto: CreateCourtDto, userRole: UserRole) {
    // Verificar que el usuario sea COURT_OWNER o SUPERADMIN
    if (userRole !== UserRole.COURT_OWNER && userRole !== UserRole.SUPERADMIN) {
      throw new ForbiddenException('Only court owners can create courts');
    }

    return this.prisma.court.create({
      data: {
        ownerId,
        ...createCourtDto,
      },
    });
  }

  async findAll(filters?: { city?: string; isActive?: boolean }) {
    const where: any = {};

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.city) {
      where.address = {
        contains: filters.city,
        mode: 'insensitive',
      };
    }

    return this.prisma.court.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const court = await this.prisma.court.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
        timeSlots: {
          where: {
            startTime: {
              gte: new Date(),
            },
          },
          orderBy: {
            startTime: 'asc',
          },
          take: 10,
        },
      },
    });

    if (!court) {
      throw new NotFoundException('Court not found');
    }

    return court;
  }

  async findMyCourtds(ownerId: string) {
    return this.prisma.court.findMany({
      where: { ownerId },
      include: {
        timeSlots: {
          where: {
            startTime: {
              gte: new Date(),
            },
          },
          take: 5,
        },
      },
    });
  }

  async update(id: string, userId: string, updateCourtDto: UpdateCourtDto, userRole: UserRole) {
    const court = await this.prisma.court.findUnique({
      where: { id },
    });

    if (!court) {
      throw new NotFoundException('Court not found');
    }

    // Verificar que sea el dueño o superadmin
    if (court.ownerId !== userId && userRole !== UserRole.SUPERADMIN) {
      throw new ForbiddenException('You can only update your own courts');
    }

    return this.prisma.court.update({
      where: { id },
      data: updateCourtDto,
    });
  }

  async remove(id: string, userId: string, userRole: UserRole) {
    const court = await this.prisma.court.findUnique({
      where: { id },
    });

    if (!court) {
      throw new NotFoundException('Court not found');
    }

    // Verificar que sea el dueño o superadmin
    if (court.ownerId !== userId && userRole !== UserRole.SUPERADMIN) {
      throw new ForbiddenException('You can only delete your own courts');
    }

    // Verificar si hay turnos activos
    const activeTimeSlots = await this.prisma.timeSlot.count({
      where: {
        courtId: id,
        startTime: {
          gte: new Date(),
        },
      },
    });

    if (activeTimeSlots > 0) {
      throw new BadRequestException(
        'Cannot delete court with active time slots. Please cancel them first.',
      );
    }

    return this.prisma.court.delete({
      where: { id },
    });
  }

  async getCourtStats(courtId: string, userId: string, userRole: UserRole) {
    const court = await this.prisma.court.findUnique({
      where: { id: courtId },
    });

    if (!court) {
      throw new NotFoundException('Court not found');
    }

    if (court.ownerId !== userId && userRole !== UserRole.SUPERADMIN) {
      throw new ForbiddenException('You can only view stats for your own courts');
    }

    const totalTimeSlots = await this.prisma.timeSlot.count({
      where: { courtId },
    });

    const bookedTimeSlots = await this.prisma.timeSlot.count({
      where: {
        courtId,
        isAvailable: false,
      },
    });

    const upcomingMatches = await this.prisma.match.count({
      where: {
        timeSlot: {
          courtId,
          startTime: {
            gte: new Date(),
          },
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
    });

    return {
      courtId,
      totalTimeSlots,
      bookedTimeSlots,
      availableTimeSlots: totalTimeSlots - bookedTimeSlots,
      occupancyRate: totalTimeSlots > 0 ? (bookedTimeSlots / totalTimeSlots) * 100 : 0,
      upcomingMatches,
    };
  }
}
