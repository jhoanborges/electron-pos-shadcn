import { createFileRoute } from "@tanstack/react-router";
import { ProductManager } from "@/components/pos/product-manager";
import { CategoryManager } from "@/components/pos/category-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function ProductsPage() {
  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="products" className="flex-1 flex flex-col">
        <div className="border-b px-6 pt-6">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="products" className="flex-1 mt-0">
          <ProductManager />
        </TabsContent>
        <TabsContent value="categories" className="flex-1 mt-0">
          <CategoryManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const Route = createFileRoute("/products")({
  component: ProductsPage,
});
