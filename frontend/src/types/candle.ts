export type Category = {
  id: number;
  name: string;
  slug: string;
};

export type Candle = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  in_stock: boolean;
  created_at: string;
  image: string | null;
  category: Category;
};