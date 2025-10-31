import { useSWRConfig } from 'swr';
import { useCallback } from 'react';

export function useProductMutations() {
  const { mutate } = useSWRConfig();

  const createProduct = useCallback(async (input: ProductInput) => {
    try {
      const response = await window.database.products.create(input);

      if (!response.success) {
        throw new Error(response.error || 'Failed to create product');
      }

      // Revalidate products list
      await mutate('database-products');

      return response.data;
    } catch (error: any) {
      console.error('Error creating product:', error);
      throw error;
    }
  }, [mutate]);

  const updateProduct = useCallback(async (id: number, input: ProductUpdate) => {
    try {
      const response = await window.database.products.update(id, input);

      if (!response.success) {
        throw new Error(response.error || 'Failed to update product');
      }

      // Revalidate products list
      await mutate('database-products');

      return response.data;
    } catch (error: any) {
      console.error('Error updating product:', error);
      throw error;
    }
  }, [mutate]);

  const deleteProduct = useCallback(async (id: number) => {
    try {
      const response = await window.database.products.delete(id);

      if (!response.success) {
        throw new Error(response.error || 'Failed to delete product');
      }

      // Revalidate products list
      await mutate('database-products');

      return true;
    } catch (error: any) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }, [mutate]);

  return {
    createProduct,
    updateProduct,
    deleteProduct,
  };
}

export function useCategoryMutations() {
  const { mutate } = useSWRConfig();

  const createCategory = useCallback(async (input: CategoryInput) => {
    try {
      const response = await window.database.categories.create(input);

      if (!response.success) {
        throw new Error(response.error || 'Failed to create category');
      }

      // Revalidate categories list
      await mutate('database-categories');
      // Also revalidate products since they reference categories
      await mutate('database-products');

      return response.data;
    } catch (error: any) {
      console.error('Error creating category:', error);
      throw error;
    }
  }, [mutate]);

  const updateCategory = useCallback(async (id: number, input: CategoryUpdate) => {
    try {
      const response = await window.database.categories.update(id, input);

      if (!response.success) {
        throw new Error(response.error || 'Failed to update category');
      }

      // Revalidate categories list
      await mutate('database-categories');
      // Also revalidate products since they reference categories
      await mutate('database-products');

      return response.data;
    } catch (error: any) {
      console.error('Error updating category:', error);
      throw error;
    }
  }, [mutate]);

  const deleteCategory = useCallback(async (id: number) => {
    try {
      const response = await window.database.categories.delete(id);

      if (!response.success) {
        throw new Error(response.error || 'Failed to delete category');
      }

      // Revalidate categories list
      await mutate('database-categories');
      // Also revalidate products since they reference categories
      await mutate('database-products');

      return true;
    } catch (error: any) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }, [mutate]);

  return {
    createCategory,
    updateCategory,
    deleteCategory,
  };
}

// Hook to fetch categories (similar to useProducts)
import useSWR from 'swr';

const categoriesFetcher = async () => {
  try {
    const response = await window.database.categories.getAll();

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch categories');
    }

    return response.data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR(
    'database-categories',
    categoriesFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
      fallbackData: [],
    }
  );

  return {
    categories: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
