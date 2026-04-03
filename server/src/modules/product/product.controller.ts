import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import {
  CategoryQueryDto,
  CreateCategoryDto,
  CreateProductDto,
  ProductQueryDto,
} from "@workspace/contracts/product";

import { ProductService } from "./product.service";
import { Roles } from "@/decorators/roles.decorator";
import { Public } from "@/decorators/public.decorator";

@Controller("products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // ── Categories ────────────────────────────────────────────

  @Public()
  @Get("categories")
  listCategories(@Query() query: CategoryQueryDto) {
    return this.productService.listCategories(query);
  }

  @Public()
  @Get("categories/:id")
  findCategory(@Param("id") id: string) {
    return this.productService.findCategory(id);
  }

  @Roles("admin")
  @Post("categories")
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.productService.createCategory(dto);
  }

  @Roles("admin")
  @Put("categories/:id")
  updateCategory(@Param("id") id: string, @Body() dto: CreateCategoryDto) {
    return this.productService.updateCategory(id, dto);
  }

  @Roles("admin")
  @Delete("categories/:id")
  deleteCategory(@Param("id") id: string) {
    return this.productService.deleteCategory(id);
  }

  // ── Products ──────────────────────────────────────────────

  @Public()
  @Get()
  listProducts(@Query() query: ProductQueryDto) {
    return this.productService.listProducts(query);
  }

  @Public()
  @Get(":id")
  findProduct(@Param("id") id: string) {
    return this.productService.findProduct(id);
  }

  @Roles("admin", "doctor", "staff")
  @Post()
  createProduct(@Body() dto: CreateProductDto) {
    return this.productService.createProduct(dto);
  }

  @Roles("admin", "doctor", "staff")
  @Put(":id")
  updateProduct(@Param("id") id: string, @Body() dto: CreateProductDto) {
    return this.productService.updateProduct(id, dto);
  }

  @Roles("admin")
  @Delete(":id")
  deleteProduct(@Param("id") id: string) {
    return this.productService.deleteProduct(id);
  }
}
