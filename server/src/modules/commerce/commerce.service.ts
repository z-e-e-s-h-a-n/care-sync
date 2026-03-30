import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { ulid } from "ulid";
import type {
  AddCartItemDto,
  CreateOrderDto,
  OrderQueryDto,
  ProductCategoryDto,
  ProductDto,
  ProductQueryDto,
  UpdateOrderStatusDto,
} from "@workspace/contracts/commerce";
import type { OrderStatus, Prisma } from "@workspace/db/client";

import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class CommerceService {
  constructor(private readonly prisma: PrismaService) {}

  async createCategory(dto: ProductCategoryDto) {
    const category = await this.prisma.productCategory.create({
      data: dto,
    });

    return { message: "Category created successfully.", data: category };
  }

  async listCategories() {
    const categories = await this.prisma.productCategory.findMany({
      where: {
        isActive: true,
      },
      orderBy: { name: "asc" },
    });

    return { message: "Categories fetched successfully.", data: categories };
  }

  async createProduct(dto: ProductDto) {
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
      isActive,
    } = query;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    if (categoryId) where.categoryId = categoryId;
    if (isActive !== undefined) where.isActive = isActive;

    if (search && searchBy) {
      const searchWhereMap: Record<typeof searchBy, Prisma.ProductWhereInput> =
        {
          name: { name: { contains: search, mode: "insensitive" } },
          sku: { sku: { contains: search, mode: "insensitive" } },
          slug: { slug: { contains: search, mode: "insensitive" } },
        };

      Object.assign(where, searchWhereMap[searchBy]);
    }

    const skip = (page - 1) * limit;
    const orderBy = { [sortBy]: sortOrder };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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

  async findProduct(productId: string) {
    const product = await this.prisma.product.findUniqueOrThrow({
      where: { id: productId },
      include: this.productInclude,
    });

    return { message: "Product fetched successfully.", data: product };
  }

  async updateProduct(productId: string, dto: ProductDto) {
    const product = await this.prisma.product.update({
      where: { id: productId },
      data: dto,
      include: this.productInclude,
    });

    return { message: "Product updated successfully.", data: product };
  }

  async getCart(currentUser: Express.User) {
    const patientProfile = await this.getCurrentPatientProfile(currentUser);
    const cart = await this.ensureCart(patientProfile.id);

    return { message: "Cart fetched successfully.", data: cart };
  }

  async upsertCartItem(dto: AddCartItemDto, currentUser: Express.User) {
    const patientProfile = await this.getCurrentPatientProfile(currentUser);
    const cart = await this.ensureCart(patientProfile.id);
    const product = await this.prisma.product.findUniqueOrThrow({
      where: { id: dto.productId },
    });

    if (!product.isActive) {
      throw new BadRequestException("Product is not available for purchase.");
    }

    if (product.stockQuantity < dto.quantity) {
      throw new BadRequestException("Not enough stock available.");
    }

    const unitPrice = Number(product.salePrice ?? product.price);
    const totalPrice = Number((unitPrice * dto.quantity).toFixed(2));

    const item = await this.prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: dto.productId,
        },
      },
      update: {
        quantity: dto.quantity,
        unitPrice,
        totalPrice,
      },
      create: {
        cartId: cart.id,
        productId: dto.productId,
        quantity: dto.quantity,
        unitPrice,
        totalPrice,
      },
      include: this.cartItemInclude,
    });

    return { message: "Cart item saved successfully.", data: item };
  }

  async removeCartItem(cartItemId: string, currentUser: Express.User) {
    const patientProfile = await this.getCurrentPatientProfile(currentUser);
    const item = await this.prisma.cartItem.findUniqueOrThrow({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (item.cart.patientId !== patientProfile.id) {
      throw new ForbiddenException("You can only modify your own cart.");
    }

    await this.prisma.cartItem.delete({ where: { id: cartItemId } });
    return { message: "Cart item removed successfully." };
  }

  async createOrder(dto: CreateOrderDto, currentUser: Express.User) {
    const patientProfile = await this.resolveOrderPatient(dto, currentUser);
    const cart = await this.prisma.cart.findUniqueOrThrow({
      where: { patientId: patientProfile.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart.items.length) {
      throw new BadRequestException("Cart is empty.");
    }

    for (const item of cart.items) {
      if (item.product.stockQuantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${item.product.name}.`,
        );
      }
    }

    const subtotalAmount = cart.items.reduce(
      (sum, item) => sum + Number(item.totalPrice),
      0,
    );
    const shippingAmount = 0;

    const order = await this.prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          patientId: patientProfile.id,
          orderNumber: `ORD-${ulid().slice(-10).toUpperCase()}`,
          notes: dto.notes,
          shippingAddress: this.asJson(dto.shippingAddress),
          billingAddress: this.asJson(dto.billingAddress),
          subtotalAmount,
          shippingAmount,
          totalAmount: subtotalAmount + shippingAmount,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              name: item.product.name,
              sku: item.product.sku,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
            })),
          },
          shipment: {
            create: {},
          },
        },
        include: this.orderInclude,
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return createdOrder;
    });

    return { message: "Order created successfully.", data: order };
  }

  async listOrders(query: OrderQueryDto, currentUser: Express.User) {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      searchBy,
      patientId,
      status,
    } = query;

    const where: Prisma.OrderWhereInput = {};
    if (patientId) where.patientId = patientId;
    if (status) where.status = status;

    if (currentUser.role !== "admin") {
      const patientProfile = await this.getCurrentPatientProfile(currentUser);
      where.patientId = patientProfile.id;
    }

    if (search && searchBy) {
      const searchWhereMap: Record<typeof searchBy, Prisma.OrderWhereInput> = {
        orderNumber: {
          orderNumber: { contains: search, mode: "insensitive" },
        },
        status: {
          status: search as OrderStatus,
        },
      };

      Object.assign(where, searchWhereMap[searchBy]);
    }

    const skip = (page - 1) * limit;
    const orderBy = { [sortBy]: sortOrder };

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: this.orderInclude,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      message: "Orders fetched successfully.",
      data: {
        orders,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOrder(orderId: string, currentUser: Express.User) {
    const order = await this.prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: this.orderInclude,
    });

    if (currentUser.role !== "admin") {
      const patientProfile = await this.getCurrentPatientProfile(currentUser);
      if (order.patientId !== patientProfile.id) {
        throw new ForbiddenException("You can only view your own orders.");
      }
    }

    return { message: "Order fetched successfully.", data: order };
  }

  async updateOrderStatus(
    orderId: string,
    dto: UpdateOrderStatusDto,
    currentUser: Express.User,
  ) {
    if (currentUser.role !== "admin") {
      throw new ForbiddenException("Only admins can update order status.");
    }

    const order = await this.prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: { items: true, shipment: true },
    });

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: dto.status,
          paymentStatus: dto.paymentStatus,
          cancelledAt: dto.status === "cancelled" ? new Date() : undefined,
          deliveredAt: dto.status === "delivered" ? new Date() : undefined,
        },
        include: this.orderInclude,
      });

      if (
        dto.shipmentStatus ||
        dto.trackingNumber ||
        dto.trackingUrl ||
        dto.carrier
      ) {
        await tx.shipment.upsert({
          where: { orderId },
          create: {
            orderId,
            status: dto.shipmentStatus ?? "pending",
            trackingNumber: dto.trackingNumber,
            trackingUrl: dto.trackingUrl,
            carrier: dto.carrier,
          },
          update: {
            status: dto.shipmentStatus,
            trackingNumber: dto.trackingNumber,
            trackingUrl: dto.trackingUrl,
            carrier: dto.carrier,
          },
        });
      }

      if (dto.status === "cancelled" && order.status !== "cancelled") {
        for (const item of order.items) {
          if (!item.productId) continue;

          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      return updatedOrder;
    });

    return { message: "Order updated successfully.", data: updated };
  }

  private async getCurrentPatientProfile(currentUser: Express.User) {
    return this.prisma.patientProfile.findUniqueOrThrow({
      where: { userId: currentUser.id },
    });
  }

  private async resolveOrderPatient(
    dto: CreateOrderDto,
    currentUser: Express.User,
  ) {
    if (currentUser.role === "admin") {
      return this.prisma.patientProfile.findUniqueOrThrow({
        where: { id: dto.patientId },
      });
    }

    const patientProfile = await this.getCurrentPatientProfile(currentUser);
    if (patientProfile.id !== dto.patientId) {
      throw new ForbiddenException("You can only create orders for yourself.");
    }
    return patientProfile;
  }

  private async ensureCart(patientId: string) {
    return this.prisma.cart.upsert({
      where: { patientId },
      update: {},
      create: { patientId },
      include: {
        items: {
          include: this.cartItemInclude,
        },
      },
    });
  }

  private productInclude = {
    category: true,
    image: true,
  } satisfies Prisma.ProductInclude;

  private cartItemInclude = {
    product: {
      include: this.productInclude,
    },
  } satisfies Prisma.CartItemInclude;

  private orderInclude = {
    items: true,
    shipment: true,
    payments: true,
    patient: {
      include: {
        user: { omit: { password: true }, include: { avatar: true } },
      },
    },
  } satisfies Prisma.OrderInclude;

  private asJson(value: unknown): Prisma.InputJsonValue | undefined {
    if (value === undefined) return undefined;
    return value as Prisma.InputJsonValue;
  }
}
