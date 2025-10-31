"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useCategories, useCategoryMutations } from "@/lib/hooks/useProductMutations"
import { Plus, Edit, Trash2 } from "lucide-react"

interface CategoryFormData {
  name: string
  description: string
}

export function CategoryManager() {
  const { categories, isLoading } = useCategories()
  const { createCategory, updateCategory, deleteCategory } = useCategoryMutations()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name || "",
        description: editingCategory.description || "",
      })
    } else {
      setFormData({
        name: "",
        description: "",
      })
    }
    setError(null)
  }, [editingCategory, dialogOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData)
      } else {
        await createCategory(formData)
      }
      setDialogOpen(false)
      setEditingCategory(null)
    } catch (error: any) {
      setError(error.message || "Failed to save category")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this category? Products using this category will have it removed.")) {
      try {
        await deleteCategory(id)
      } catch (error: any) {
        alert("Failed to delete category: " + error.message)
      }
    }
  }

  const openCreateDialog = () => {
    setEditingCategory(null)
    setDialogOpen(true)
  }

  const openEditDialog = (category: any) => {
    setEditingCategory(category)
    setDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Categories</h2>
          <p className="text-gray-600">Manage product categories</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center text-gray-500">
              No categories yet. Add your first category!
            </CardContent>
          </Card>
        ) : (
          categories.map((category: any) => (
            <Card key={category.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEditDialog(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(category.id)}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update the category details"
                : "Create a new product category"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">
                  Category Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
