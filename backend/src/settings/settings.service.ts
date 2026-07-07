import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const PUBLIC_KEYS_EXACT = ['store.name', 'whatsapp.number'];
const PUBLIC_PREFIXES = ['shipping.', 'tax.', 'social.'];

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublic() {
    const rows = await this.prisma.setting.findMany();
    const publicRows = rows.filter(
      (r) =>
        PUBLIC_KEYS_EXACT.includes(r.key) || PUBLIC_PREFIXES.some((p) => r.key.startsWith(p)),
    );
    return Object.fromEntries(publicRows.map((r) => [r.key, r.value]));
  }

  async getAll() {
    const rows = await this.prisma.setting.findMany({ orderBy: { key: 'asc' } });
    return rows;
  }

  async bulkUpsert(entries: { key: string; value: unknown }[]) {
    await this.prisma.$transaction(
      entries.map((e) =>
        this.prisma.setting.upsert({
          where: { key: e.key },
          create: { key: e.key, value: e.value as Prisma.InputJsonValue },
          update: { value: e.value as Prisma.InputJsonValue },
        }),
      ),
    );
    return this.getAll();
  }
}
