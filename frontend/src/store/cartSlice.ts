import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type CartLine = {
  candle_id: number;
  quantity: number;
};

type CartState = {
  items: CartLine[];
};

const initialState: CartState = {
  items: [],
};

function upsert(items: CartLine[], candle_id: number, quantity: number) {
  const idx = items.findIndex((x) => x.candle_id === candle_id);
  if (idx === -1) return [...items, { candle_id, quantity }];
  const copy = items.slice();
  copy[idx] = { candle_id, quantity };
  return copy;
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<CartLine[]>) => {
      state.items = action.payload;
    },

    addToCart: (state, action: PayloadAction<{ candle_id: number; quantity?: number }>) => {
      const qty = Math.max(1, Math.trunc(action.payload.quantity ?? 1));
      const existing = state.items.find((x) => x.candle_id === action.payload.candle_id);
      const nextQty = existing ? existing.quantity + qty : qty;
      state.items = upsert(state.items, action.payload.candle_id, nextQty);
    },

    updateQty: (state, action: PayloadAction<{ candle_id: number; quantity: number }>) => {
      const qty = Math.max(1, Math.trunc(action.payload.quantity));
      state.items = upsert(state.items, action.payload.candle_id, qty);
    },

    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((x) => x.candle_id !== action.payload);
    },

    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { setCart, addToCart, updateQty, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;