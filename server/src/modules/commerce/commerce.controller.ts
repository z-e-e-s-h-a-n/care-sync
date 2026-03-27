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
} from "@nestjs/common";
import {
  AddCartItemDto,
  CreateOrderDto,
  OrderQueryDto,
  ProductCategoryDto,
  ProductDto,
  ProductQueryDto,
  UpdateOrderStatusDto,
} from "@workspace/contracts/commerce";

import { CommerceService } from "./commerce.service";
import { Public } from "@/decorators/public.decorator";
import { Roles } from "@/decorators/roles.decorator";
import { User } from "@/decorators/user.decorator";

@Controller("commerce")
export class CommerceController {
  constructor(private readonly commerceService: CommerceService) {}

  @Roles("admin")
  @Post("categories")
  createCategory(@Body() dto: ProductCategoryDto) {
    return this.commerceService.createCategory(dto);
  }

  @Public()
  @Get("categories")
  listCategories() {
    return this.commerceService.listCategories();
  }

  @Roles("admin")
  @Post("products")
  createProduct(@Body() dto: ProductDto) {
    return this.commerceService.createProduct(dto);
  }

  @Public()
  @Get("products")
  listProducts(@Query() query: ProductQueryDto) {
    return this.commerceService.listProducts(query);
  }

  @Public()
  @Get("products/:productId")
  findProduct(@Param("productId") productId: string) {
    return this.commerceService.findProduct(productId);
  }

  @Roles("admin")
  @Put("products/:productId")
  updateProduct(
    @Param("productId") productId: string,
    @Body() dto: ProductDto,
  ) {
    return this.commerceService.updateProduct(productId, dto);
  }

  @Roles("patient")
  @Get("cart")
  getCart(@User() user: Express.User) {
    return this.commerceService.getCart(user);
  }

  @Roles("patient")
  @Post("cart/items")
  upsertCartItem(@Body() dto: AddCartItemDto, @User() user: Express.User) {
    return this.commerceService.upsertCartItem(dto, user);
  }

  @Roles("patient")
  @Delete("cart/items/:cartItemId")
  removeCartItem(
    @Param("cartItemId") cartItemId: string,
    @User() user: Express.User,
  ) {
    return this.commerceService.removeCartItem(cartItemId, user);
  }

  @Roles("admin", "patient")
  @Post("orders")
  createOrder(@Body() dto: CreateOrderDto, @User() user: Express.User) {
    return this.commerceService.createOrder(dto, user);
  }

  @Roles("admin", "patient")
  @Get("orders")
  listOrders(@Query() query: OrderQueryDto, @User() user: Express.User) {
    return this.commerceService.listOrders(query, user);
  }

  @Roles("admin", "patient")
  @Get("orders/:orderId")
  findOrder(@Param("orderId") orderId: string, @User() user: Express.User) {
    return this.commerceService.findOrder(orderId, user);
  }

  @Roles("admin")
  @Patch("orders/:orderId/status")
  updateOrderStatus(
    @Param("orderId") orderId: string,
    @Body() dto: UpdateOrderStatusDto,
    @User() user: Express.User,
  ) {
    return this.commerceService.updateOrderStatus(orderId, dto, user);
  }
}
