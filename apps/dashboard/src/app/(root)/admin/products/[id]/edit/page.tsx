import React from "react";
import PageIntro from "@/components/dashboard/PageIntro";
import ProductForm from "@/components/forms/ProductForm";
import type { AppPageProps } from "@workspace/contracts";

const EditProductPage = async ({ params }: AppPageProps) => {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <PageIntro
        title="Edit product"
        description="Update the product details, pricing, and inventory."
      />
      <ProductForm formType="update" entityId={id} />
    </div>
  );
};

export default EditProductPage;
