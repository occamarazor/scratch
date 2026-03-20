import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

import type { Nullable } from './types';

@Injectable()
export class ParseNullableIntPipe implements PipeTransform<Nullable<string>, Nullable<number>> {
  transform(value: Nullable<string>): Nullable<number> {
    // Missing or blank -> undefined (treat as absent)
    if (value === undefined || value === '') return undefined;

    // Explicit null string (or literal null if someone passes JSON null) -> reject
    if (value === 'null') {
      throw new BadRequestException('OwnerId "null" is not allowed.');
    }

    const parsed = Number(value);

    if (Number.isInteger(parsed)) return parsed;

    throw new BadRequestException(
      `Validation failed (ownerId must be an integer). Received: ${value}`,
    );
  }
}
