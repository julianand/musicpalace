export const productSortOptions = [
  { label: 'Top rated', value: 'rating' },
  { label: 'Most recent', value: 'recent' },
  { label: 'Price: low to high', value: 'price_asc' },
  { label: 'Price: high to low', value: 'price_desc' },
] as const;

export type ProductSort = typeof productSortOptions[number]['value'];

export const PRODUCTS_MAIN_RECORD_PAGINATION = 9;