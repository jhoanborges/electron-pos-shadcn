"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Product } from "@/lib/types"
import { useCategories } from "@/lib/hooks/useProductMutations"

interface ProductFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
  product?: Product | null
  title: string
  description: string
}

export function ProductFormDialog({
  open,
  onClose,
  onSubmit,
  product,
  title,
  description,
}: ProductFormDialogProps) {
  const { categories } = useCategories()
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category_id: "",
    sku: "",
    image: "",
    description: "",
    stock: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset form when product changes or dialog opens/closes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        price: String(product.price || ""),
        category_id: typeof product.category === 'object' && product.category !== null
          ? String(product.category.id || "")
          : String(product.category_id || ""),
        sku: product.sku || "",
        image: product.image || "",
        description: product.description || "",
        stock: String(product.stock || ""),
      })
    } else {
      setFormData({
        name: "",
        price: "",
        category_id: "",
        sku: "",
        image: "",
        description: "",
        stock: "0",
      })
    }
    setError(null)
  }, [product, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const data: any = {
        name: formData.name,
        price: parseFloat(formData.price),
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        sku: formData.sku,
        image: formData.image || undefined,
        description: formData.description || undefined,
        stock: formData.stock ? parseInt(formData.stock) : 0,
      }

      await onSubmit(data)
      onClose()
    } catch (error: any) {
      setError(error.message || "Failed to save product")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Product Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">
                  SKU <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">
                  Price <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category_id || "none"}
                onValueChange={(value) => setFormData({ ...formData, category_id: value === "none" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
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
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
