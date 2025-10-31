import { getDatabase } from "./db";

// ============================================
// Product Operations
// ============================================

export interface ProductRow {
  id: number;
  name: string;
  price: number;
  category_id: number | null;
  sku: string;
  image: string | null;
  description: string | null;
  stock: number;
  created_at: string;
  updated_at: string;
}

export interface ProductWithCategory extends ProductRow {
  category: string | null;
}

export interface CreateProductInput {
  name: string;
  price: number;
  category_id: number | null;
  sku: string;
  image?: string;
  description?: string;
  stock?: number;
}

export interface UpdateProductInput {
  name?: string;
  price?: number;
  category_id?: number | null;
  sku?: string;
  image?: string;
  description?: string;
  stock?: number;
}

export function getAllProducts(): ProductWithCategory[] {
  const db = getDatabase();
  const products = db.prepare(`
    SELECT
      p.*,
      c.name as category
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.name ASC
  `).all() as ProductWithCategory[];

  return products;
}

export function getProductById(id: number): ProductWithCategory | null {
  const db = getDatabase();
  const product = db.prepare(`
    SELECT
      p.*,
      c.name as category
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `).get(id) as ProductWithCategory | undefined;

  return product || null;
}

export function createProduct(input: CreateProductInput): ProductWithCategory {
  const db = getDatabase();

  const result = db.prepare(`
    INSERT INTO products (name, price, category_id, sku, image, description, stock)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    input.name,
    input.price,
    input.category_id,
    input.sku,
    input.image || null,
    input.description || null,
    input.stock || 0
  );

  const product = getProductById(result.lastInsertRowid as number);
  if (!product) {
    throw new Error("Failed to create product");
  }

  return product;
}

export function updateProduct(id: number, input: UpdateProductInput): ProductWithCategory {
  const db = getDatabase();

  // Build dynamic update query
  const updates: string[] = [];
  const values: any[] = [];

  if (input.name !== undefined) {
    updates.push("name = ?");
    values.push(input.name);
  }
  if (input.price !== undefined) {
    updates.push("price = ?");
    values.push(input.price);
  }
  if (input.category_id !== undefined) {
    updates.push("category_id = ?");
    values.push(input.category_id);
  }
  if (input.sku !== undefined) {
    updates.push("sku = ?");
    values.push(input.sku);
  }
  if (input.image !== undefined) {
    updates.push("image = ?");
    values.push(input.image);
  }
  if (input.description !== undefined) {
    updates.push("description = ?");
    values.push(input.description);
  }
  if (input.stock !== undefined) {
    updates.push("stock = ?");
    values.push(input.stock);
  }

  if (updates.length === 0) {
    const product = getProductById(id);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  }

  updates.push("updated_at = CURRENT_TIMESTAMP");
  values.push(id);

  db.prepare(`
    UPDATE products
    SET ${updates.join(", ")}
    WHERE id = ?
  `).run(...values);

  const product = getProductById(id);
  if (!product) {
    throw new Error("Product not found");
  }

  return product;
}

export function deleteProduct(id: number): void {
  const db = getDatabase();
  const result = db.prepare("DELETE FROM products WHERE id = ?").run(id);

  if (result.changes === 0) {
    throw new Error("Product not found");
  }
}

export function searchProducts(query: string): ProductWithCategory[] {
  const db = getDatabase();
  const searchTerm = `%${query}%`;

  const products = db.prepare(`
    SELECT
      p.*,
      c.name as category
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.name LIKE ? OR p.sku LIKE ? OR p.description LIKE ?
    ORDER BY p.name ASC
  `).all(searchTerm, searchTerm, searchTerm) as ProductWithCategory[];

  return products;
}

export function getProductsByCategory(categoryId: number): ProductWithCategory[] {
  const db = getDatabase();

  const products = db.prepare(`
    SELECT
      p.*,
      c.name as category
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.category_id = ?
    ORDER BY p.name ASC
  `).all(categoryId) as ProductWithCategory[];

  return products;
}

// ============================================
// Category Operations
// ============================================

export interface CategoryRow {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
}

export function getAllCategories(): CategoryRow[] {
  const db = getDatabase();
  const categories = db.prepare(`
    SELECT * FROM categories
    ORDER BY name ASC
  `).all() as CategoryRow[];

  return categories;
}

export function getCategoryById(id: number): CategoryRow | null {
  const db = getDatabase();
  const category = db.prepare(`
    SELECT * FROM categories WHERE id = ?
  `).get(id) as CategoryRow | undefined;

  return category || null;
}

export function createCategory(input: CreateCategoryInput): CategoryRow {
  const db = getDatabase();

  const result = db.prepare(`
    INSERT INTO categories (name, description)
    VALUES (?, ?)
  `).run(input.name, input.description || null);

  const category = getCategoryById(result.lastInsertRowid as number);
  if (!category) {
    throw new Error("Failed to create category");
  }

  return category;
}

export function updateCategory(id: number, input: UpdateCategoryInput): CategoryRow {
  const db = getDatabase();

  const updates: string[] = [];
  const values: any[] = [];

  if (input.name !== undefined) {
    updates.push("name = ?");
    values.push(input.name);
  }
  if (input.description !== undefined) {
    updates.push("description = ?");
    values.push(input.description);
  }

  if (updates.length === 0) {
    const category = getCategoryById(id);
    if (!category) {
      throw new Error("Category not found");
    }
    return category;
  }

  updates.push("updated_at = CURRENT_TIMESTAMP");
  values.push(id);

  db.prepare(`
    UPDATE categories
    SET ${updates.join(", ")}
    WHERE id = ?
  `).run(...values);

  const category = getCategoryById(id);
  if (!category) {
    throw new Error("Category not found");
  }

  return category;
}

export function deleteCategory(id: number): void {
  const db = getDatabase();

  // Check if any products use this category
  const productCount = db.prepare(`
    SELECT COUNT(*) as count FROM products WHERE category_id = ?
  `).get(id) as { count: number };

  if (productCount.count > 0) {
    throw new Error(`Cannot delete category: ${productCount.count} product(s) are using it`);
  }

  const result = db.prepare("DELETE FROM categories WHERE id = ?").run(id);

  if (result.changes === 0) {
    throw new Error("Category not found");
  }
}
