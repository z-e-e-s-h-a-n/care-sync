import PageIntro from "@/components/dashboard/PageIntro";
import ProductForm from "@/components/forms/ProductForm";

const NewProductPage = () => {
  return (
    <div className="space-y-6">
      <PageIntro
        title="Add product"
        description="Create a new product listing for the shop."
      />
      <ProductForm formType="add" />
    </div>
  );
};

export default NewProductPage;
