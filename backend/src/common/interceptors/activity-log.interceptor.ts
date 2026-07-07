import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../decorators';

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/** Writes an ActivityLog row for every successful mutating request. */
@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ActivityLogInterceptor.name);

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    if (!MUTATING.has(request.method)) return next.handle();

    return next.handle().pipe(
      tap(() => {
        const user: JwtPayload | undefined = request.user;
        const path: string = request.originalUrl ?? request.url;
        // Fire and forget — logging must never break the request.
        this.prisma.activityLog
          .create({
            data: {
              userId: user?.sub ?? null,
              action: `${request.method} ${path.split('?')[0]}`,
              entity: request.params?.id ?? request.params?.number ?? request.params?.slug ?? null,
              meta: { params: request.params ?? {} },
              ip: request.ip ?? null,
            },
          })
          .catch((err) => this.logger.warn(`activity log failed: ${err.message}`));
      }),
    );
  }
}
