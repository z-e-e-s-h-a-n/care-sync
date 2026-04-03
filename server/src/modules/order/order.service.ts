import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type {
  AddToCartDto,
  UpdateCartItemDto,
  CheckoutDto,
  UpdateOrderStatusDto,
  CreateShipmentDto,
  UpdateShipmentDto,
  OrderQueryDto,
} from "@workspace/contracts/order";
import type { Prisma } from "@workspace/db/client";
import { createReference } from "@workspace/shared/utils";

import { PrismaService } from "@/modules/prisma/prisma.service";
import { OtpService } from "@/modules/auth/otp.service";

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
  ) {}

  // ── Cart ──────────────────────────────────────────────────

  async getCart(userId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { userId },
      include: this.cartItemInclude,
      orderBy: { createdAt: "asc" },
    });
    return {
      message: "Cart fetched successfully.",
      data: { items },
    };
  }

  async addToCart(dto: AddToCartDto, userId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, status: "active" },
    });

    if (!product) {
      throw new NotFoundException("Product not found or unavailable.");
    }

    if (product.stockCount < dto.quantity) {
      throw new BadRequestException("Insufficient stock.");
    }

    const item = await this.prisma.cartItem.upsert({
      where: { userId_productId: { userId, productId: dto.productId } },
      create: { userId, productId: dto.productId, quantity: dto.quantity },
      update: { quantity: dto.quantity },
      include: this.cartItemInclude,
    });

    return {
      message: "Item added to cart.",
      data: item,
    };
  }

  async updateCartItem(itemId: string, dto: UpdateCartItemDto, userId: string) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, userId },
    });

    if (!item) throw new NotFoundException("Cart item not found.");

    const updated = await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
      include: this.cartItemInclude,
    });

    return {
      message: "Cart item updated.",
      data: updated,
    };
  }

  async removeCartItem(itemId: string, userId: string) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, userId },
    });

    if (!item) throw new NotFoundException("Cart item not found.");

    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return { message: "Cart item removed." };
  }

  async clearCart(userId: string) {
    await this.prisma.cartItem.deleteMany({ where: { userId } });
    return { message: "Cart cleared." };
  }

  // ── Orders ────────────────────────────────────────────────

  async checkout(dto: CheckoutDto, currentUser?: Express.User) {
    const email = dto.email?.trim();
    const firstName = dto.firstName?.trim();
    const lastName = dto.lastName?.trim();
    const phone = dto.phone?.trim();

    if (!email || !firstName || !lastName || !phone) {
      throw new BadRequestException(
        "Email, first name, last name, and phone are required.",
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      if (currentUser?.id) {
        const user = await tx.user.findUniqueOrThrow({
          where: { id: currentUser.id },
        });

        if (user.phone !== phone) {
          await tx.user.update({
            where: { id: currentUser.id },
            data: { phone },
          });
        }

        const cartItems = await tx.cartItem.findMany({
          where: { userId: currentUser.id },
          include: { product: true },
        });

        if (!cartItems.length) {
          throw new BadRequestException("Cart is empty.");
        }

        const subtotal = cartItems.reduce(
          (sum, item) => sum + Number(item.product.sellPrice) * item.quantity,
          0,
        );

        const order = await tx.order.create({
          data: {
            userId: currentUser.id,
            orderNumber: this.createOrderNumber(),
            status: "pending",
            deliveryType: dto.deliveryType,
            notes: dto.notes,
            shippingName:
              dto.shippingName ?? `${firstName} ${lastName}`.trim(),
            shippingPhone: dto.shippingPhone ?? phone,
            shippingStreet: dto.shippingStreet,
            shippingCity: dto.shippingCity,
            shippingState: dto.shippingState,
            shippingPostalCode: dto.shippingPostalCode,
            shippingCountry: dto.shippingCountry,
            subtotal,
            shippingCost: 0,
            discountAmount: 0,
            total: subtotal,
            items: {
              create: cartItems.map((item) => ({
                productId: item.productId,
                productName: item.product.name,
                unitPrice: item.product.sellPrice,
                quantity: item.quantity,
                totalPrice: Number(item.product.sellPrice) * item.quantity,
              })),
            },
          },
          include: this.orderInclude,
        });

        await tx.cartItem.deleteMany({ where: { userId: currentUser.id } });
        return order;
      }

      const items = dto.items ?? [];
      if (!items.length) {
        throw new BadRequestException("Cart is empty.");
      }

      const products = await tx.product.findMany({
        where: {
          id: { in: items.map((item) => item.productId) },
          status: "active",
        },
      });

      if (products.length !== items.length) {
        throw new BadRequestException("One or more products are unavailable.");
      }

      const priceMap = new Map(
        products.map((product) => [product.id, product.sellPrice]),
      );
      const subtotal = items.reduce(
        (sum, item) => sum + Number(priceMap.get(item.productId)) * item.quantity,
        0,
      );

      let user = await tx.user.findFirst({
        where: { email },
      });

      const isNewUser = !user;
      if (!user) {
        user = await tx.user.create({
          data: {
            email,
            firstName,
            lastName,
            displayName: `${firstName} ${lastName}`.trim(),
            phone,
            role: "patient",
          },
        });
      } else {
        user = await tx.user.update({
          where: { id: user.id },
          data: {
            firstName,
            lastName,
            displayName: `${firstName} ${lastName}`.trim(),
            phone,
          },
        });
      }

      if (isNewUser) {
        await this.otpService.sendOtp({
          user,
          identifier: email,
          type: "secureToken",
          purpose: "setPassword",
        });
      }

      return tx.order.create({
        data: {
          userId: user.id,
          orderNumber: this.createOrderNumber(),
          status: "pending",
          deliveryType: dto.deliveryType,
          notes: dto.notes,
          shippingName: dto.shippingName ?? `${firstName} ${lastName}`.trim(),
          shippingPhone: dto.shippingPhone ?? phone,
          shippingStreet: dto.shippingStreet,
          shippingCity: dto.shippingCity,
          shippingState: dto.shippingState,
          shippingPostalCode: dto.shippingPostalCode,
          shippingCountry: dto.shippingCountry,
          subtotal,
          shippingCost: 0,
          discountAmount: 0,
          total: subtotal,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              productName:
                products.find((product) => product.id === item.productId)?.name ?? "",
              unitPrice: priceMap.get(item.productId)!,
              quantity: item.quantity,
              totalPrice: Number(priceMap.get(item.productId)) * item.quantity,
            })),
          },
        },
        include: this.orderInclude,
      });
    });

    return {
      message: "Order placed successfully.",
      data: result,
    };
  }

  async listOrders(query: OrderQueryDto, currentUser: Express.User) {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      searchBy,
      status,
      deliveryType,
      userId,
    } = query;

    const where: Prisma.OrderWhereInput = {};

    // Patients can only see their own orders
    if (currentUser.role === "patient") {
      where.userId = currentUser.id;
    } else if (userId) {
      where.userId = userId;
    }

    if (status) where.status = status;
    if (deliveryType) where.deliveryType = deliveryType;

    if (search && searchBy) {
      const searchWhereMap: Record<typeof searchBy, Prisma.OrderWhereInput> = {
        orderNumber: { orderNumber: { contains: search, mode: "insensitive" } },
        status: { status: search as any },
        userId: { userId: search },
      };
      Object.assign(where, searchWhereMap[searchBy]);
    }

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
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

    if (currentUser.role === "patient" && order.userId !== currentUser.id) {
      throw new ForbiddenException("You can only view your own orders.");
    }

    return { message: "Order fetched successfully.", data: order };
  }

  async updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto) {
    const now = new Date();
    const timestamps: Record<string, Date | null> = {};

    if (dto.status === "processing") timestamps.confirmedAt = now;
    if (dto.status === "shipped") timestamps.shippedAt = now;
    if (dto.status === "delivered") timestamps.deliveredAt = now;
    if (dto.status === "cancelled") timestamps.cancelledAt = now;

    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: dto.status, ...timestamps },
      include: this.orderInclude,
    });

    return { message: "Order status updated.", data: order };
  }

  // ── Shipments ─────────────────────────────────────────────

  async createShipment(orderId: string, dto: CreateShipmentDto) {
    await this.prisma.order.findUniqueOrThrow({ where: { id: orderId } });

    const shipment = await this.prisma.shipment.create({
      data: { orderId, ...dto },
    });

    return { message: "Shipment created.", data: shipment };
  }

  async updateShipment(shipmentId: string, dto: UpdateShipmentDto) {
    const now = new Date();
    const timestamps: Record<string, Date | null> = {};

    if (dto.status === "shipped") timestamps.shippedAt = now;
    if (dto.status === "delivered") timestamps.deliveredAt = now;
    if (dto.status === "cancelled") timestamps.cancelledAt = now;

    const shipment = await this.prisma.shipment.update({
      where: { id: shipmentId },
      data: { ...dto, ...timestamps },
    });

    return { message: "Shipment updated.", data: shipment };
  }

  // ── Includes ──────────────────────────────────────────────

  private cartItemInclude = {
    product: {
      include: {
        images: {
          take: 1,
        },
      },
    },
  } satisfies Prisma.CartItemInclude;

  private orderInclude = {
    user: { omit: { password: true } },
    items: {
      include: {
        product: {
          include: {
            images: {
              take: 1,
            },
          },
        },
      },
    },
    shipments: { orderBy: { createdAt: "desc" } },
  } satisfies Prisma.OrderInclude;

  private createOrderNumber() {
    return createReference("order");
  }
}
