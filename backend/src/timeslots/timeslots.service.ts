import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTimeSlotDto } from './dto/create-timeslot.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class TimeslotsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createTimeSlotDto: CreateTimeSlotDto, userRole: UserRole) {
    const { courtId, startTime, endTime, price } = createTimeSlotDto;

    // Verificar que la cancha existe
    const court = await this.prisma.court.findUnique({
      where: { id: courtId },
    });

    if (!court) {
      throw new NotFoundException('Court not found');
    }

    // Verificar que sea el dueño o superadmin
    if (court.ownerId !== userId && userRole !== UserRole.SUPERADMIN) {
      throw new ForbiddenException('You can only create time slots for your own courts');
    }

    // Validar que startTime sea antes de endTime
    if (new Date(startTime) >= new Date(endTime)) {
      throw new BadRequestException('Start time must be before end time');
    }

    // Verificar que no haya overlap con otros turnos
    const overlappingSlots = await this.prisma.timeSlot.findMany({
      where: {
        courtId,
        OR: [
          {
            AND: [
              { startTime: { lte: new Date(startTime) } },
              { endTime: { gt: new Date(startTime) } },
            ],
          },
          {
            AND: [
              { startTime: { lt: new Date(endTime) } },
              { endTime: { gte: new Date(endTime) } },
            ],
          },
        ],
      },
    });

    if (overlappingSlots.length > 0) {
      throw new BadRequestException('Time slot overlaps with existing slot');
    }

    return this.prisma.timeSlot.create({
      data: {
        courtId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        price: price || court.pricePerHour,
      },
      include: {
        court: true,
      },
    });
  }

  async findAll(filters?: {
    courtId?: string;
    startDate?: string;
    endDate?: string;
    isAvailable?: boolean;
  }) {
    const where: any = {};

    if (filters?.courtId) {
      where.courtId = filters.courtId;
    }

    if (filters?.isAvailable !== undefined) {
      where.isAvailable = filters.isAvailable;
    }

    if (filters?.startDate || filters?.endDate) {
      where.startTime = {};
      if (filters.startDate) {
        where.startTime.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.startTime.lte = new Date(filters.endDate);
      }
    }

    return this.prisma.timeSlot.findMany({
      where,
      include: {
        court: true,
        match: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const timeSlot = await this.prisma.timeSlot.findUnique({
      where: { id },
      include: {
        court: true,
        match: {
          include: {
            organizer: {
              select: {
                id: true,
                profile: true,
              },
            },
            players: {
              include: {
                user: {
                  select: {
                    id: true,
                    profile: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!timeSlot) {
      throw new NotFoundException('Time slot not found');
    }

    return timeSlot;
  }

  async remove(id: string, userId: string, userRole: UserRole) {
    const timeSlot = await this.prisma.timeSlot.findUnique({
      where: { id },
      include: {
        court: true,
        match: true,
      },
    });

    if (!timeSlot) {
      throw new NotFoundException('Time slot not found');
    }

    // Verificar que sea el dueño o superadmin
    if (timeSlot.court.ownerId !== userId && userRole !== UserRole.SUPERADMIN) {
      throw new ForbiddenException('You can only delete time slots from your own courts');
    }

    // No permitir eliminar si hay un partido asociado
    if (timeSlot.match) {
      throw new BadRequestException(
        'Cannot delete time slot with an associated match. Cancel the match first.',
      );
    }

    return this.prisma.timeSlot.delete({
      where: { id },
    });
  }
}
