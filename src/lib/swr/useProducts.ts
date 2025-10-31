import useSWR from 'swr';
import type { Product } from '../types';

// Fetcher function using IPC to get products from SQLite
const fetcher = async (): Promise<Product[]> => {
  try {
    const response = await window.database.products.getAll();

    if (!response.success) {
      console.error('Database error:', response.error);
      throw new Error(response.error || 'Failed to fetch products');
    }

    console.log('Products from database:', response.data);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export function useProducts() {
  const { data, error, isLoading, mutate } = useSWR<Product[]>(
    'database-products',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
      onError: (err) => {
        console.error('SWR error:', err);
      },
      // Add fallback data to prevent crashes
      fallbackData: [],
    }
  );

  console.log('Products data:', data);
  console.log('Products error:', error);
  console.log('Products loading:', isLoading);

  // Transform products to ensure price is a number and handle category object
  const transformedProducts = data?.map(product => ({
    ...product,
    price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
    // Extract category name if it's an object, otherwise use the value or default
    category: typeof product.category === 'object' && product.category !== null
      ? product.category.name
      : (product.category || 'Uncategorized')
  })) || [];

  return {
    products: transformedProducts,
    isLoading,
    isError: error,
    mutate,
  };
}
