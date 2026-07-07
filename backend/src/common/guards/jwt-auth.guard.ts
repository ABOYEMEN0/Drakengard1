import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY, JwtPayload } from '../decorators';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Always try to attach the user if a token is present (useful on public routes).
    const token = this.extractToken(request);
    if (token) {
      try {
        request.user = await this.jwtService.verifyAsync<JwtPayload>(token, {
          secret: process.env.JWT_ACCESS_SECRET ?? 'change-me-access',
        });
      } catch {
        request.user = undefined;
      }
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    if (!request.user) throw new UnauthorizedException('Invalid or missing access token');
    return true;
  }

  private extractToken(request: any): string | undefined {
    const header: string | undefined = request.headers?.authorization;
    if (header?.startsWith('Bearer ')) return header.slice(7);
    return request.cookies?.accessToken;
  }
}
