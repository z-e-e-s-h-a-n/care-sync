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

    const where: Prisma.ProductCategoryWhereInput = {};

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
      where: { OR: [{ id }, { slug: id }] },
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

  // ── Products ──────────────────────────────────────────────

  async createProduct(dto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: dto,
      include: this.productInclude,
    });
    return { message: "Product created successfully.", data: product };
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
        products,
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
    return { message: "Product fetched successfully.", data: product };
  }

  async updateProduct(id: string, dto: CreateProductDto) {
    const product = await this.prisma.product.update({
      where: { id },
      data: dto,
      include: this.productInclude,
    });
    return { message: "Product updated successfully.", data: product };
  }

  async deleteProduct(id: string) {
    await this.prisma.product.delete({
      where: { id },
    });
    return { message: "Product deleted successfully." };
  }

  // ── Shared ────────────────────────────────────────────────

  private categoryInclude = {
    parent: true,
    children: true,
  } satisfies Prisma.ProductCategoryInclude;

  private productInclude = {
    category: true,
    images: true,
  } satisfies Prisma.ProductInclude;
}
