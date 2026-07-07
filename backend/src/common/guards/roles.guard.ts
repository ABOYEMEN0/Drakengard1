import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleName } from '@prisma/client';
import { JwtPayload, ROLES_KEY } from '../decorators';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<RoleName[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles || roles.length === 0) return true;

    const user: JwtPayload | undefined = context.switchToHttp().getRequest().user;
    if (!user) throw new ForbiddenException('Authentication required');
    // SUPER_ADMIN always passes role checks.
    if (user.role === RoleName.SUPER_ADMIN || roles.includes(user.role)) return true;
    throw new ForbiddenException('Insufficient role');
  }
}
