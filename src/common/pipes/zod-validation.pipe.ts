import { Injectable, PipeTransform } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  // Parses and validates request body against Zod schema
  transform(value: unknown) {
    return this.schema.parse(value);
  }
}
