import { Injectable } from "@nestjs/common";
import type {
  CategoryQueryDto,
  CreateCategoryDto,
  CreateProductDto,
  ProductQueryDto,
} from "@workspace/contracts/product";
import type { Prisma } from "@workspace/db/client";

import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Categories ────────────────────────────────────────────

  async createCategory(dto: CreateCategoryDto) {
    const category = await this.prisma.productCategory.create({ data: dto });
    return { message: "Category created successfully.", data: category };
  }

  async listCategories(query: CategoryQueryDto) {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      searchBy,
      parentId,
      isActive,
    } = query;

    const where: Prisma.ProductCategoryWhereInput = { deletedAt: null };

    if (parentId) where.parentId = parentId;
    if (isActive) where.isActive = isActive;

    if (search && searchBy) {
      const searchWhereMap: Record<
        typeof searchBy,
        Prisma.ProductCategoryWhereInput
      > = {
        name: { name: { contains: search, mode: "insensitive" } },
        slug: { slug: { contains: search, mode: "insensitive" } },
      };
      Object.assign(where, searchWhereMap[searchBy]);
    }

    const skip = (page - 1) * limit;
    const [categories, total] = await Promise.all([
      this.prisma.productCategory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: this.categoryInclude,
      }),
      this.prisma.productCategory.count({ where }),
    ]);

    return {
      message: "Categories fetched successfully.",
      data: {
        categories,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findCategory(id: string) {
    const category = await this.prisma.productCategory.findFirstOrThrow({
      where: {
        OR: [{ id }, { slug: id }],
        deletedAt: null,
      },
      include: this.categoryInclude,
    });
    return { message: "Category fetched successfully.", data: category };
  }

  async updateCategory(id: string, dto: CreateCategoryDto) {
    const category = await this.prisma.productCategory.update({
      where: { id },
      data: dto,
    });
    return { message: "Category updated successfully.", data: category };
  }

  async deleteCategory(id: string) {
    await this.prisma.productCategory.delete({
      where: { id },
    });
    return { message: "Category deleted successfully." };
  }

  async restoreCategory(id: string) {
    await this.prisma.productCategory.update({
      where: { id },
      data: { deletedAt: null },
    });

    return { message: "Category restored successfully." };
  }

  // ── Products ──────────────────────────────────────────────

  async createProduct(dto: CreateProductDto) {
    const { imageIds = [], price, ...productData } = dto as CreateProductDto & {
      imageIds?: string[];
      price: number;
    };

    const product = await this.prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          ...(productData as Prisma.ProductCreateInput),
          sellPrice: price,
        },
      });

      await this.syncProductImages(tx, created.id, imageIds);

      return tx.product.findUniqueOrThrow({
        where: { id: created.id },
        include: this.productInclude,
      });
    });

    return {
      message: "Product created successfully.",
      data: this.serializeProduct(product),
    };
  }

  async listProducts(query: ProductQueryDto) {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      searchBy,
      categoryId,
      status,
      inventoryStatus,
    } = query;

    const where: Prisma.ProductWhereInput = { deletedAt: null };

    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (inventoryStatus) where.inventoryStatus = inventoryStatus;

    if (search && searchBy) {
      const searchWhereMap: Record<typeof searchBy, Prisma.ProductWhereInput> =
        {
          name: { name: { contains: search, mode: "insensitive" } },
          slug: { slug: { contains: search, mode: "insensitive" } },
        };
      Object.assign(where, searchWhereMap[searchBy]);
    }

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: this.productInclude,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      message: "Products fetched successfully.",
      data: {
        products: products.map((product) => this.serializeProduct(product)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findProduct(id: string) {
    const product = await this.prisma.product.findFirstOrThrow({
      where: {
        OR: [{ id }, { slug: id }],
        deletedAt: null,
      },
      include: this.productInclude,
    });
    return {
      message: "Product fetched successfully.",
      data: this.serializeProduct(product),
    };
  }

  async updateProduct(id: string, dto: CreateProductDto) {
    const { imageIds = [], price, ...productData } = dto as CreateProductDto & {
      imageIds?: string[];
      price: number;
    };

    const product = await this.prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          ...(productData as Prisma.ProductUpdateInput),
          sellPrice: price,
        },
      });

      await this.syncProductImages(tx, id, imageIds);

      return tx.product.findUniqueOrThrow({
        where: { id },
        include: this.productInclude,
      });
    });

    return {
      message: "Product updated successfully.",
      data: this.serializeProduct(product),
    };
  }

  async deleteProduct(id: string) {
    await this.prisma.product.delete({
      where: { id },
    });
    return { message: "Product deleted successfully." };
  }

  async restoreProduct(id: string) {
    await this.prisma.product.update({
      where: { id },
      data: { deletedAt: null },
    });

    return { message: "Product restored successfully." };
  }

  // ── Shared ────────────────────────────────────────────────

  private categoryInclude = {
    parent: true,
    children: true,
  } satisfies Prisma.ProductCategoryInclude;

  private productInclude = {
    category: true,
    images: {
      where: { deletedAt: null },
      include: {
        uploadedBy: {
          omit: { password: true },
        },
      },
      orderBy: { createdAt: "asc" },
    },
  } satisfies Prisma.ProductInclude;

  private async syncProductImages(
    tx: Prisma.TransactionClient,
    productId: string,
    imageIds: string[],
  ) {
    await tx.media.updateMany({
      where: {
        productId,
        ...(imageIds.length ? { id: { notIn: imageIds } } : {}),
      },
      data: {
        productId: null,
      },
    });

    if (!imageIds.length) return;

    await tx.media.updateMany({
      where: {
        id: { in: imageIds },
        deletedAt: null,
      },
      data: {
        productId,
        type: "product",
      },
    });
  }

  private serializeProduct(product: any) {
    const { sellPrice, costPrice, images, ...rest } = product;

    return {
      ...rest,
      price: Number(sellPrice),
      costPrice: costPrice == null ? undefined : Number(costPrice),
      images,
    };
  }
}
