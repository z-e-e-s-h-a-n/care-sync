import React from "react";
import type { AppPageProps } from "@workspace/contracts";
import PageIntro from "@/components/dashboard/PageIntro";
import CategoryForm from "@/components/forms/CategoryForm";

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
