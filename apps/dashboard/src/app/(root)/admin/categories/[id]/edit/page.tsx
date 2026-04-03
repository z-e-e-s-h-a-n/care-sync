import React from "react";
import PageIntro from "@/components/dashboard/PageIntro";
import CategoryForm from "@/components/forms/CategoryForm";
import type { AppPageProps } from "@workspace/contracts";

const EditCategoryPage = async ({ params }: AppPageProps) => {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <PageIntro
        title="Edit category"
        description="Update the category details and visibility."
      />
      <CategoryForm formType="update" entityId={id} />
    </div>
  );
};

export default EditCategoryPage;
