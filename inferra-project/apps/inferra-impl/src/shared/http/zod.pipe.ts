import {
  BadRequestException,
  Injectable,
  type PipeTransform,
} from "@nestjs/common";
import { ZodType } from "zod";
@Injectable()
export class ZodPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}
  transform(value: unknown) {
    const parsed = this.schema.safeParse(value);
    if (!parsed.success)
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        errors: parsed.error.issues.map(({ path, code }) => ({
          field: path.join("."),
          code,
        })),
      });
    return parsed.data;
  }
}
