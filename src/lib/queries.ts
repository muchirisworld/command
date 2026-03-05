import { queryOptions } from '@tanstack/react-query'
import { getProducts, getProduct, getVariantStock } from './api-client'

export const productsQueryOptions = () =>
  queryOptions({
    queryKey: ['products'],
    queryFn: () => getProducts(),
  })

export const productQueryOptions = (productId: string) =>
  queryOptions({
    queryKey: ['products', productId],
    queryFn: () => getProduct({ data: productId }),
  })

export const variantStockQueryOptions = (variantId: string) =>
  queryOptions({
    queryKey: ['variants', variantId, 'stock'],
    queryFn: () => getVariantStock({ data: variantId }),
  })
