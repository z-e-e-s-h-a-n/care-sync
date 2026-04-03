import PageIntro from "@/components/dashboard/PageIntro";
import CategoryForm from "@/components/forms/CategoryForm";

const NewCategoryPage = () => (
  <div className="space-y-6">
    <PageIntro
      title="Add Category"
      description="Create a new product category."
    />
    <CategoryForm formType="add" />
  </div>
);

export default NewCategoryPage;
