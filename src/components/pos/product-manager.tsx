"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useProducts } from "@/lib/swr/useProducts"
import { useProductMutations } from "@/lib/hooks/useProductMutations"
import { ProductFormDialog } from "./product-form-dialog"
import type { Product } from "@/lib/types"
import { Plus, Edit, Trash2, Search } from "lucide-react"

export function ProductManager() {
  const { products, isLoading } = useProducts()
  const { createProduct, updateProduct, deleteProduct } = useProductMutations()
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreate = async (data: any) => {
    await createProduct(data)
  }

  const handleUpdate = async (data: any) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, data)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id)
      } catch (error: any) {
        alert("Failed to delete product: " + error.message)
      }
    }
  }

  const openCreateDialog = () => {
    setEditingProduct(null)
    setDialogOpen(true)
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingProduct(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Product Management</h1>
        <p className="text-gray-600">Manage your product catalog</p>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search products by name or SKU..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="grid gap-4">
          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                {searchQuery ? "No products found matching your search" : "No products yet. Add your first product!"}
              </CardContent>
            </Card>
          ) : (
            filteredProducts.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>SKU: {product.sku}</span>
                        <span>•</span>
                        <span>Price: ${typeof product.price === 'string' ? parseFloat(product.price).toFixed(2) : product.price.toFixed(2)}</span>
                        {product.stock !== undefined && (
                          <>
                            <span>•</span>
                            <span>Stock: {product.stock}</span>
                          </>
                        )}
                        {product.category && (
                          <>
                            <span>•</span>
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                              {typeof product.category === 'object' && product.category !== null
                                ? product.category.name
                                : product.category}
                            </span>
                          </>
                        )}
                      </div>
                      {product.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEditDialog(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <ProductFormDialog
        open={dialogOpen}
        onClose={closeDialog}
        onSubmit={editingProduct ? handleUpdate : handleCreate}
        product={editingProduct}
        title={editingProduct ? "Edit Product" : "Add New Product"}
        description={editingProduct ? "Update the product details" : "Add a new product to your catalog"}
      />
    </div>
  )
}
