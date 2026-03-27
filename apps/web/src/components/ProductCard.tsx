import Link from "next/link";
import type { ProductResponse } from "@workspace/contracts/commerce";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { formatPrice } from "@workspace/shared/utils";

interface ProductCardProps {
  product: ProductResponse;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const displayPrice = Number(product.salePrice ?? product.price);

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{product.name}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {product.category?.name ?? "Healthcare product"}
            </p>
          </div>
          <Badge variant="outline" className="capitalize">
            {product.isActive ? "Available" : "Hidden"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {product.description ??
            "Product description will appear here once published by the care team."}
        </p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Stock</span>
          <span className="font-medium">{product.stockQuantity} available</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-semibold">
            {formatPrice(displayPrice)}
          </span>
          {product.salePrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/store/${product.id}`}>View product</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
