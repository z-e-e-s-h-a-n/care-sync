import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
} from "@nestjs/common";
import type { Request, Response } from "express";
import {
  AddToCartDto,
  UpdateCartItemDto,
  CreateOrderDto,
  GuestCheckoutDto,
  UpdateOrderStatusDto,
  CreateShipmentDto,
  UpdateShipmentDto,
  OrderQueryDto,
} from "@workspace/contracts/order";

import { OrderService } from "./order.service";
import { TokenService } from "@/modules/token/token.service";
import { Roles } from "@/decorators/roles.decorator";
import { Public } from "@/decorators/public.decorator";
import { User } from "@/decorators/user.decorator";

@Controller("orders")
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly tokenService: TokenService,
  ) {}

  // ── Cart ──────────────────────────────────────────────────

  @Roles("patient")
  @Get("cart")
  getCart(@User("id") userId: string) {
    return this.orderService.getCart(userId);
  }

  @Roles("patient")
  @Post("cart")
  addToCart(@Body() dto: AddToCartDto, @User("id") userId: string) {
    return this.orderService.addToCart(dto, userId);
  }

  @Roles("patient")
  @Put("cart/:itemId")
  updateCartItem(
    @Param("itemId") itemId: string,
    @Body() dto: UpdateCartItemDto,
    @User("id") userId: string,
  ) {
    return this.orderService.updateCartItem(itemId, dto, userId);
  }

  @Roles("patient")
  @Delete("cart/:itemId")
  removeCartItem(@Param("itemId") itemId: string, @User("id") userId: string) {
    return this.orderService.removeCartItem(itemId, userId);
  }

  @Roles("patient")
  @Delete("cart")
  clearCart(@User("id") userId: string) {
    return this.orderService.clearCart(userId);
  }

  // ── Orders ────────────────────────────────────────────────

  @Roles("patient")
  @Post()
  createOrder(@Body() dto: CreateOrderDto, @User("id") userId: string) {
    return this.orderService.createOrder(dto, userId);
  }

  @Public()
  @Post("guest-checkout")
  async guestCheckout(
    @Body() dto: GuestCheckoutDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.orderService.guestCheckout(dto);
    const user = result.data.user;
    await this.tokenService.createAuthSession(req, res, {
      id: user.id,
      role: user.role,
      status: user.status,
    });
    return { message: result.message, data: { order: result.data.order } };
  }

  @Roles("admin", "doctor", "staff", "patient")
  @Get()
  listOrders(@Query() query: OrderQueryDto, @User() user: Express.User) {
    return this.orderService.listOrders(query, user);
  }

  @Roles("admin", "doctor", "staff", "patient")
  @Get(":orderId")
  findOrder(@Param("orderId") orderId: string, @User() user: Express.User) {
    return this.orderService.findOrder(orderId, user);
  }

  @Roles("admin", "doctor", "staff")
  @Patch(":orderId/status")
  updateOrderStatus(
    @Param("orderId") orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateOrderStatus(orderId, dto);
  }

  // ── Shipments ─────────────────────────────────────────────

  @Roles("admin", "doctor", "staff")
  @Post(":orderId/shipments")
  createShipment(
    @Param("orderId") orderId: string,
    @Body() dto: CreateShipmentDto,
  ) {
    return this.orderService.createShipment(orderId, dto);
  }

  @Roles("admin", "doctor", "staff")
  @Patch("shipments/:shipmentId")
  updateShipment(
    @Param("shipmentId") shipmentId: string,
    @Body() dto: UpdateShipmentDto,
  ) {
    return this.orderService.updateShipment(shipmentId, dto);
  }
}
