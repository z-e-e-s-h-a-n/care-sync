import { ZodError } from "zod";
import { ZodValidationException } from "nestjs-zod";
import type { Request, Response } from "express";
import {
  Catch,
  HttpException,
  HttpStatus,
  type ExceptionFilter,
  type ArgumentsHost,
} from "@nestjs/common";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  PrismaClientUnknownRequestError,
  PrismaClientInitializationError,
  PrismaClientRustPanicError,
} from "@prisma/client/runtime/client";

import { InjectLogger } from "@/decorators/logger.decorator";
import { LoggerService } from "@/modules/logger/logger.service";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  @InjectLogger()
  private readonly logger!: LoggerService;

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    let action: string | undefined = undefined;
    let errorCode: string | undefined = undefined;
    let meta: Record<string, any> | undefined = undefined;

    // ---------- NestJS HttpException ----------
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === "object" && response !== null) {
        const resObj = response as any;

        if (Array.isArray(resObj.message)) {
          message = resObj.message.join(", ");
        } else if (typeof resObj.message === "string") {
          message = resObj.message;
        } else {
          message = "Request failed";
        }

        action = resObj.action;
        meta = resObj.meta;
        errorCode = resObj.errorCode;
      } else {
        message = exception.message;
      }
    }

    // -------- Prisma ClientKnownRequestError --------
    else if (exception instanceof PrismaClientKnownRequestError) {
      switch (exception.code) {
        case "P2002": {
          status = 409;
          const target = Array.isArray(exception.meta?.target)
            ? exception.meta?.target.join(", ")
            : String(exception.meta?.target ?? "");
          message = `Duplicate entry${target ? `: ${target}` : ""}`;
          break;
        }
        case "P2025": {
          status = 404;

          const model =
            typeof exception.meta?.modelName === "string"
              ? exception.meta.modelName
              : "Resource";

          message = `${model} not found`;
          break;
        }
        case "P2003":
          status = 400;
          message = "Foreign key constraint failed";
          break;
        case "P2016":
          status = 400;
          message = "Query interpretation error";
          break;
        case "P2011":
          status = 400;
          message = "Null constraint violation";
          break;
        case "P2012":
          status = 400;
          message = "Missing required value";
          break;
        case "P2014":
          status = 400;
          message = "Invalid relation operation";
          break;
        case "P2001":
          status = 404;
          message = "Record does not exist";
          break;
        default:
          status = 400;
          message = "Database operation failed";
      }
    }

    // -------- Prisma Validation Error --------
    else if (exception instanceof PrismaClientValidationError) {
      status = 400;
      const errorMessage = exception.message;

      if (errorMessage.includes("Unknown argument")) {
        const match = errorMessage.match(/Unknown argument `(\w+)`/);
        if (match) {
          message = `Invalid field: ${match[1]} is not a valid field for this operation`;
        } else {
          message = "Invalid data provided for database operation";
        }
      } else if (errorMessage.includes("Invalid value")) {
        message = "Invalid data format provided";
      } else {
        message = "Database validation failed";
      }
    }

    // -------- Prisma Unknown Request Error --------
    else if (exception instanceof PrismaClientUnknownRequestError) {
      status = 400;
      message = "Database request error";

      if (process.env.NODE_ENV === "development") {
        meta = { detail: exception.message };
      }
    }

    // -------- Prisma Initialization Error --------
    else if (exception instanceof PrismaClientInitializationError) {
      status = 500;
      message = "Database connection failed";

      if (process.env.NODE_ENV === "development") {
        meta = { detail: exception.message };
      }
    }

    // -------- Prisma Rust Panic Error --------
    else if (exception instanceof PrismaClientRustPanicError) {
      status = 500;
      message = "Database engine error";

      if (process.env.NODE_ENV === "development") {
        meta = { detail: exception.message };
      }
    }

    // ---------- Zod validation errors ----------
    else if (
      exception instanceof ZodValidationException ||
      exception instanceof ZodError
    ) {
      status = HttpStatus.BAD_REQUEST;

      const zodError = (
        exception instanceof ZodValidationException
          ? exception.getZodError()
          : exception
      ) as ZodError;

      meta = zodError.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
        errorCode: issue.code,
      }));

      message = "Validation failed";
    }

    // ---------- Other runtime errors ----------
    else if (exception instanceof Error) {
      message = exception.message || message;
    }

    // ---------- Logging ----------
    this.logger.error("❌ Exception caught", {
      message: exception.message,
      stack: exception.stack,
      status,
      path: req.url,
      method: req.method,
      errorCode,
      meta,
    });

    // ---------- Response ----------
    res.status(status).json({
      status,
      success: false,
      message,
      action,
      meta,
      errorCode,
    });
  }
}
