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
  AddProductImageDto,
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
  @Get("categories/:identifier")
  findCategory(@Param("identifier") identifier: string) {
    return this.productService.findCategory(identifier);
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

  // ── Products ──────────────────────────────────────────────

  @Public()
  @Get()
  listProducts(@Query() query: ProductQueryDto) {
    return this.productService.listProducts(query);
  }

  @Public()
  @Get(":identifier")
  findProduct(@Param("identifier") identifier: string) {
    return this.productService.findProduct(identifier);
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

  @Roles("admin", "doctor", "staff")
  @Post(":productId/images")
  addProductImage(
    @Param("productId") productId: string,
    @Body() dto: AddProductImageDto,
  ) {
    return this.productService.addProductImage(productId, dto);
  }

  @Roles("admin", "doctor", "staff")
  @Delete(":productId/images/:imageId")
  removeProductImage(
    @Param("productId") productId: string,
    @Param("imageId") imageId: string,
  ) {
    return this.productService.removeProductImage(productId, imageId);
  }
}
