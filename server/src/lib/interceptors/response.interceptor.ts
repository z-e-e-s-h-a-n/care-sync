import {
  Injectable,
  type NestInterceptor,
  type ExecutionContext,
  type CallHandler,
  StreamableFile,
} from "@nestjs/common";
import { Observable, map } from "rxjs";
import isPlainObject from "lodash/isPlainObject.js";
import { Decimal } from "@prisma/client/runtime/client";

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((res) => {
        if (
          !res ||
          typeof res !== "object" ||
          res instanceof StreamableFile ||
          Buffer.isBuffer(res)
        ) {
          return res;
        }

        const action = res.action;
        const statusCode = response.statusCode;
        const { data = null, message = "Success", meta = null } = res || {};

        return {
          status: statusCode,
          success: statusCode >= 200 && statusCode < 300,
          message,
          data: this.sanitizeResponse(data),
          action,
          meta,
        };
      }),
    );
  }

  private sanitizeResponse<T>(value: T): T {
    if (value === null || value === undefined) {
      return undefined as T;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.sanitizeResponse(item)) as T;
    }

    if (isPlainObject(value)) {
      const result: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        const sanitized = this.sanitizeResponse(val);
        if (sanitized !== undefined) {
          result[key] = sanitized;
        }
      }
      return result as T;
    }

    if (value instanceof Decimal) {
      return (value as Decimal).toNumber() as unknown as T;
    }

    return value;
  }
}
