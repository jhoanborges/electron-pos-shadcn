import Database from "better-sqlite3";
import { app } from "electron";
import path from "path";

let db: Database.Database | null = null;

export function initializeDatabase() {
  if (db) {
    console.log("Database already initialized");
    return db;
  }

  try {
    // Store database in user data directory
    const userDataPath = app.getPath("userData");
    const dbPath = path.join(userDataPath, "pos-database.db");

    console.log("Initializing database at:", dbPath);

    db = new Database(dbPath);

    // Enable foreign keys
    db.pragma("foreign_keys = ON");

    console.log("Creating tables...");
    createTables();

    console.log("Seeding initial data...");
    seedInitialData();

    console.log("Database initialization complete");
    return db;
  } catch (error) {
    console.error("Error during database initialization:", error);
    db = null;
    throw error;
  }
}

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error("Database not initialized. Call initializeDatabase() first.");
  }
  return db;
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

function createTables() {
  const db = getDatabase();

  // Create categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      category_id INTEGER,
      sku TEXT NOT NULL UNIQUE,
      image TEXT,
      description TEXT,
      stock INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )
  `);

  console.log("Database tables created successfully");
}

function seedInitialData() {
  const db = getDatabase();

  // Check if we already have data
  const categoryCount = db.prepare("SELECT COUNT(*) as count FROM categories").get() as { count: number };
  if (categoryCount.count > 0) {
    console.log("Database already has data, skipping seed");
    return;
  }

  console.log("Seeding initial data...");

  // Insert categories
  const insertCategory = db.prepare(`
    INSERT INTO categories (name, description)
    VALUES (?, ?)
  `);

  const categories = [
    { name: "Beverages", description: "Drinks and beverages" },
    { name: "Snacks", description: "Chips, candy, and snacks" },
    { name: "Groceries", description: "General grocery items" },
    { name: "Bakery", description: "Bread and baked goods" },
    { name: "Dairy", description: "Milk, cheese, and dairy products" },
  ];

  const categoryIds: Record<string, number> = {};
  for (const category of categories) {
    const result = insertCategory.run(category.name, category.description);
    categoryIds[category.name] = result.lastInsertRowid as number;
  }

  // Insert sample products
  const insertProduct = db.prepare(`
    INSERT INTO products (name, price, category_id, sku, description, stock)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const products = [
    { name: "Coca Cola", price: 2.50, category: "Beverages", sku: "BEV001", description: "Classic Coca Cola 330ml", stock: 50 },
    { name: "Pepsi", price: 2.25, category: "Beverages", sku: "BEV002", description: "Pepsi 330ml", stock: 45 },
    { name: "Orange Juice", price: 3.99, category: "Beverages", sku: "BEV003", description: "Fresh orange juice 1L", stock: 30 },
    { name: "Potato Chips", price: 1.99, category: "Snacks", sku: "SNK001", description: "Classic potato chips 150g", stock: 60 },
    { name: "Chocolate Bar", price: 1.50, category: "Snacks", sku: "SNK002", description: "Milk chocolate bar 100g", stock: 80 },
    { name: "Pretzels", price: 2.75, category: "Snacks", sku: "SNK003", description: "Salted pretzels 200g", stock: 40 },
    { name: "White Bread", price: 2.99, category: "Bakery", sku: "BKY001", description: "Fresh white bread loaf", stock: 25 },
    { name: "Croissant", price: 1.75, category: "Bakery", sku: "BKY002", description: "Butter croissant", stock: 35 },
    { name: "Whole Milk", price: 3.49, category: "Dairy", sku: "DRY001", description: "Whole milk 1L", stock: 40 },
    { name: "Cheddar Cheese", price: 4.99, category: "Dairy", sku: "DRY002", description: "Aged cheddar cheese 250g", stock: 30 },
  ];

  for (const product of products) {
    insertProduct.run(
      product.name,
      product.price,
      categoryIds[product.category],
      product.sku,
      product.description,
      product.stock
    );
  }

  console.log("Initial data seeded successfully");
}
