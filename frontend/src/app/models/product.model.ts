export interface Price {
  s: string;  // store name
  p: number;  // price
}

export interface Product {
  id: number;
  name: string;
  cat: string;
  icon: string;
  desc: string;
  prices: Price[];
}

export interface CartItem {
  id: number;
  name: string;
  icon: string;
  store: string;
  price: number;
}
