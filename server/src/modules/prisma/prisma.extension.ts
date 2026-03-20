import { Prisma } from "@workspace/db/client";
import { SoftDeleteModels } from "./soft-delete.models";

export type SoftDeleteExtraArgs = {
  force?: boolean | string;
};

export const softDeleteExtension = Prisma.defineExtension((client) =>
  client.$extends({
    name: "softDelete",
    query: {
      $allModels: {
        // Single delete
        async delete<T, A extends Prisma.Args<T, "delete">>({
          model,
          args,
          query,
        }: {
          model: string;
          args: Prisma.Exact<A & SoftDeleteExtraArgs, A & SoftDeleteExtraArgs>;
          query: (args: A) => Promise<Prisma.Result<T, A, "delete">>;
        }) {
          const hasDel = SoftDeleteModels.has(model);
          const { force, ...rest } = args as A & SoftDeleteExtraArgs;
          const isForce = force === true || force === "true";

          if (hasDel && !isForce) {
            return (client as any)[model].update({
              where: rest.where,
              data: { deletedAt: new Date() },
            });
          }

          return query(rest as A);
        },

        // Delete many
        async deleteMany<T, A extends Prisma.Args<T, "deleteMany">>({
          model,
          args,
          query,
        }: {
          model: string;
          args: Prisma.Exact<A & SoftDeleteExtraArgs, A & SoftDeleteExtraArgs>;
          query: (args: A) => Promise<Prisma.Result<T, A, "deleteMany">>;
        }) {
          const hasDel = SoftDeleteModels.has(model);
          const { force, ...rest } = args as A & SoftDeleteExtraArgs;
          const isForce = force === true || force === "true";

          if (hasDel && !isForce) {
            return (client as any)[model].updateMany({
              where: rest.where,
              data: { deletedAt: new Date() },
            });
          }

          return query(rest as A);
        },

        // Intercept all operations
        async $allOperations<T, A>({
          model,
          operation,
          args,
          query,
        }: {
          model: string;
          operation: string;
          args: A & SoftDeleteExtraArgs;
          query: (args: A) => Promise<Prisma.Result<T, A, any>>;
        }) {
          const hasDel = SoftDeleteModels.has(model);
          const readOps = [
            "findFirst",
            "findMany",
            "count",
            "aggregate",
          ] as const;

          if (
            hasDel &&
            (operation === "findUnique" || operation === "findUniqueOrThrow")
          ) {
            const next: any = { ...args };
            next.where ??= {};

            if (next.where.deletedAt === undefined) {
              next.where.deletedAt = null;
            }

            return operation === "findUniqueOrThrow"
              ? (client as any)[model].findFirstOrThrow(next)
              : (client as any)[model].findFirst(next);
          }

          if (!hasDel || !readOps.includes(operation as any)) {
            return query(args as A);
          }

          const next: any = { ...args };

          next.where ??= {};
          if (next.where.deletedAt === undefined) {
            next.where.deletedAt = null;
          }

          return query(next as A);
        },
      },
    },
  }),
);

export type ExtendedPrismaClient = ReturnType<typeof softDeleteExtension>;
