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
  CartItemDto,
  UpdateCartItemDto,
  SyncCartDto,
  CheckoutDto,
  CreateManualOrderDto,
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
  addToCart(@Body() dto: CartItemDto, @User("id") userId: string) {
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
  @Post("cart/sync")
  syncCart(@Body() dto: SyncCartDto, @User("id") userId: string) {
    return this.orderService.syncCart(dto.items, userId, dto.mode);
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

  @Public()
  @Post()
  async checkout(
    @Body() dto: CheckoutDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const currentUser = await this.resolveCheckoutUser(req, res);
    return this.orderService.checkout(dto, currentUser);
  }

  @Roles("admin", "doctor", "staff")
  @Post("manual")
  createManualOrder(@Body() dto: CreateManualOrderDto) {
    return this.orderService.createManualOrder(dto);
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

  private async resolveCheckoutUser(req: Request, res: Response) {
    try {
      const payload = await this.tokenService.verifyToken(req, "accessToken");
      this.tokenService.attachAuthContext(req, payload);
      return req.user;
    } catch {
      try {
        const payload = await this.tokenService.verifyToken(
          req,
          "refreshToken",
        );
        await this.tokenService.refreshTokens(req, res, payload);
        return req.user;
      } catch {
        return undefined;
      }
    }
  }
}
