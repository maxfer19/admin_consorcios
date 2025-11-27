import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { PlayerLevel, MatchStatus } from '@prisma/client';

@Injectable()
export class MatchesService {
  constructor(private prisma: PrismaService) {}

  async create(organizerId: string, createMatchDto: CreateMatchDto) {
    const { timeSlotId, spotsAvailable, requiredLevel, notes } = createMatchDto;

    // Verificar que el timeslot existe y está disponible
    const timeSlot = await this.prisma.timeSlot.findUnique({
      where: { id: timeSlotId },
      include: { match: true },
    });

    if (!timeSlot) {
      throw new NotFoundException('Time slot not found');
    }

    if (!timeSlot.isAvailable || timeSlot.match) {
      throw new BadRequestException('Time slot is not available');
    }

    // Crear el partido
    const match = await this.prisma.match.create({
      data: {
        timeSlotId,
        organizerId,
        spotsAvailable,
        requiredLevel,
        notes,
      },
      include: {
        timeSlot: {
          include: {
            court: true,
          },
        },
        organizer: {
          select: {
            id: true,
            profile: true,
          },
        },
      },
    });

    // Marcar el timeslot como no disponible
    await this.prisma.timeSlot.update({
      where: { id: timeSlotId },
      data: { isAvailable: false },
    });

    // Agregar al organizador como jugador
    await this.prisma.matchPlayer.create({
      data: {
        matchId: match.id,
        userId: organizerId,
      },
    });

    return match;
  }

  async findAll(filters?: {
    level?: PlayerLevel;
    startDate?: string;
    endDate?: string;
    city?: string;
    status?: MatchStatus;
  }) {
    const where: any = {};

    if (filters?.level) {
      where.requiredLevel = filters.level;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate || filters?.city) {
      where.timeSlot = {};

      if (filters.startDate || filters.endDate) {
        where.timeSlot.startTime = {};
        if (filters.startDate) {
          where.timeSlot.startTime.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.timeSlot.startTime.lte = new Date(filters.endDate);
        }
      }

      if (filters.city) {
        where.timeSlot.court = {
          address: {
            contains: filters.city,
            mode: 'insensitive',
          },
        };
      }
    }

    // Solo mostrar partidos con spots disponibles
    where.spotsAvailable = {
      gt: 0,
    };

    return this.prisma.match.findMany({
      where,
      include: {
        timeSlot: {
          include: {
            court: true,
          },
        },
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
      orderBy: {
        timeSlot: {
          startTime: 'asc',
        },
      },
    });
  }

  async findOne(id: string) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: {
        timeSlot: {
          include: {
            court: true,
          },
        },
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
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    return match;
  }

  async joinMatch(matchId: string, userId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        players: true,
      },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (match.spotsAvailable <= 0) {
      throw new BadRequestException('No spots available');
    }

    // Verificar que el usuario no esté ya en el partido
    const alreadyJoined = match.players.some((p) => p.userId === userId);
    if (alreadyJoined) {
      throw new BadRequestException('You are already in this match');
    }

    // Agregar al jugador
    await this.prisma.matchPlayer.create({
      data: {
        matchId,
        userId,
      },
    });

    // Decrementar spots disponibles
    await this.prisma.match.update({
      where: { id: matchId },
      data: {
        spotsAvailable: {
          decrement: 1,
        },
      },
    });

    return this.findOne(matchId);
  }

  async leaveMatch(matchId: string, userId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        players: true,
      },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    // No permitir que el organizador se vaya
    if (match.organizerId === userId) {
      throw new BadRequestException('Organizer cannot leave the match. Cancel it instead.');
    }

    const matchPlayer = match.players.find((p) => p.userId === userId);
    if (!matchPlayer) {
      throw new BadRequestException('You are not in this match');
    }

    // Eliminar al jugador
    await this.prisma.matchPlayer.delete({
      where: { id: matchPlayer.id },
    });

    // Incrementar spots disponibles
    await this.prisma.match.update({
      where: { id: matchId },
      data: {
        spotsAvailable: {
          increment: 1,
        },
      },
    });

    return this.findOne(matchId);
  }

  async cancelMatch(matchId: string, userId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (match.organizerId !== userId) {
      throw new ForbiddenException('Only the organizer can cancel the match');
    }

    // Actualizar estado del match
    await this.prisma.match.update({
      where: { id: matchId },
      data: {
        status: MatchStatus.CANCELLED,
      },
    });

    // Liberar el timeslot
    await this.prisma.timeSlot.update({
      where: { id: match.timeSlotId },
      data: { isAvailable: true },
    });

    return this.findOne(matchId);
  }
}
