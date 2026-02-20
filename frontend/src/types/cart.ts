export type CartItem = {
  id: number;
  candle_id: number;
  candle_name: string;
  unit_price: string;
  quantity: number;
  line_total?: string;
};

export type Cart = {
  id: number;
  items: CartItem[];
};