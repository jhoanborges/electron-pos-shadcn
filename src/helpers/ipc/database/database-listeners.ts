import { ipcMain } from "electron";
import * as db from "../../database/operations";
import {
  DB_PRODUCTS_GET_ALL,
  DB_PRODUCTS_GET_BY_ID,
  DB_PRODUCTS_CREATE,
  DB_PRODUCTS_UPDATE,
  DB_PRODUCTS_DELETE,
  DB_PRODUCTS_SEARCH,
  DB_PRODUCTS_GET_BY_CATEGORY,
  DB_CATEGORIES_GET_ALL,
  DB_CATEGORIES_GET_BY_ID,
  DB_CATEGORIES_CREATE,
  DB_CATEGORIES_UPDATE,
  DB_CATEGORIES_DELETE,
} from "./database-channels";

export function addDatabaseEventListeners() {
  // ============================================
  // Product Listeners
  // ============================================

  ipcMain.handle(DB_PRODUCTS_GET_ALL, async () => {
    try {
      return { success: true, data: db.getAllProducts() };
    } catch (error: any) {
      console.error("Error getting all products:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(DB_PRODUCTS_GET_BY_ID, async (_event, id: number) => {
    try {
      const product = db.getProductById(id);
      if (!product) {
        return { success: false, error: "Product not found" };
      }
      return { success: true, data: product };
    } catch (error: any) {
      console.error("Error getting product by id:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(DB_PRODUCTS_CREATE, async (_event, input: db.CreateProductInput) => {
    try {
      const product = db.createProduct(input);
      return { success: true, data: product };
    } catch (error: any) {
      console.error("Error creating product:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(DB_PRODUCTS_UPDATE, async (_event, id: number, input: db.UpdateProductInput) => {
    try {
      const product = db.updateProduct(id, input);
      return { success: true, data: product };
    } catch (error: any) {
      console.error("Error updating product:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(DB_PRODUCTS_DELETE, async (_event, id: number) => {
    try {
      db.deleteProduct(id);
      return { success: true };
    } catch (error: any) {
      console.error("Error deleting product:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(DB_PRODUCTS_SEARCH, async (_event, query: string) => {
    try {
      return { success: true, data: db.searchProducts(query) };
    } catch (error: any) {
      console.error("Error searching products:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(DB_PRODUCTS_GET_BY_CATEGORY, async (_event, categoryId: number) => {
    try {
      return { success: true, data: db.getProductsByCategory(categoryId) };
    } catch (error: any) {
      console.error("Error getting products by category:", error);
      return { success: false, error: error.message };
    }
  });

  // ============================================
  // Category Listeners
  // ============================================

  ipcMain.handle(DB_CATEGORIES_GET_ALL, async () => {
    try {
      return { success: true, data: db.getAllCategories() };
    } catch (error: any) {
      console.error("Error getting all categories:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(DB_CATEGORIES_GET_BY_ID, async (_event, id: number) => {
    try {
      const category = db.getCategoryById(id);
      if (!category) {
        return { success: false, error: "Category not found" };
      }
      return { success: true, data: category };
    } catch (error: any) {
      console.error("Error getting category by id:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(DB_CATEGORIES_CREATE, async (_event, input: db.CreateCategoryInput) => {
    try {
      const category = db.createCategory(input);
      return { success: true, data: category };
    } catch (error: any) {
      console.error("Error creating category:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(DB_CATEGORIES_UPDATE, async (_event, id: number, input: db.UpdateCategoryInput) => {
    try {
      const category = db.updateCategory(id, input);
      return { success: true, data: category };
    } catch (error: any) {
      console.error("Error updating category:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(DB_CATEGORIES_DELETE, async (_event, id: number) => {
    try {
      db.deleteCategory(id);
      return { success: true };
    } catch (error: any) {
      console.error("Error deleting category:", error);
      return { success: false, error: error.message };
    }
  });

  console.log("Database IPC listeners registered");
}
