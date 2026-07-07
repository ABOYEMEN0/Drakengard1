import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RoleName } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from '../common/decorators';
import { LoginDto, RegisterDto } from './dto/auth.dto';

const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async buildPayload(userId: string): Promise<JwtPayload> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    });
    return {
      sub: user.id,
      email: user.email,
      role: user.role.name,
      permissions: user.role.permissions.map((rp) => rp.permission.key),
    };
  }

  private async issueTokens(userId: string) {
    const payload = await this.buildPayload(userId);
    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET ?? 'change-me-access',
      expiresIn: (process.env.JWT_ACCESS_TTL ?? '15m') as `${number}m`,
    });
    const refreshToken = randomBytes(48).toString('hex');
    await this.prisma.refreshToken.create({
      data: {
        tokenHash: this.hashToken(refreshToken),
        userId,
        expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
      },
    });
    return { accessToken, refreshToken, payload };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictException('Email already registered');

    const role = await this.prisma.role.findUniqueOrThrow({ where: { name: RoleName.CUSTOMER } });
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        phone: dto.phone || null,
        passwordHash: await bcrypt.hash(dto.password, 10),
        roleId: role.id,
      },
    });
    const tokens = await this.issueTokens(user.id);
    return { user: this.publicUser(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user || !user.isActive || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const tokens = await this.issueTokens(user.id);
    return { user: this.publicUser(user), ...tokens };
  }

  /** Rotate: revoke the presented refresh token and issue a new pair. */
  async refresh(refreshToken?: string) {
    if (!refreshToken) throw new UnauthorizedException('Missing refresh token');
    const record = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: this.hashToken(refreshToken) },
      include: { user: true },
    });
    if (!record || record.revokedAt || record.expiresAt < new Date() || !record.user.isActive) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    await this.prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date() },
    });
    const tokens = await this.issueTokens(record.userId);
    return { user: this.publicUser(record.user), ...tokens };
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: { tokenHash: this.hashToken(refreshToken), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    return { success: true };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    });
    return {
      ...this.publicUser(user),
      role: user.role.name,
      permissions: user.role.permissions.map((rp) => rp.permission.key),
    };
  }

  private publicUser(user: { id: string; email: string; name: string; phone: string | null; loyaltyLevel: string }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      loyaltyLevel: user.loyaltyLevel,
    };
  }
}
