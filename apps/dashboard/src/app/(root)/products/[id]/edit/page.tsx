import React from "react";
import type { AppPageProps } from "@workspace/contracts";
import PageIntro from "@/components/dashboard/PageIntro";
import ProductForm from "@/components/forms/ProductForm";

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
