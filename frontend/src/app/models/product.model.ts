// ─── Local / seller-listed product ──────────────────────────────────────────
export interface Price {
  s: string;   // store name
  p: number;   // price
}

export interface Product {
  id: number;
  name: string;
  cat: string;
  icon: string;
  desc: string;
  prices: Price[];
  // Amazon-enriched fields (present for real products)
  asin?: string;
  photo?: string;
  productUrl?: string;
  rating?: string;
  numRatings?: number;
  isPrime?: boolean;
  salesVolume?: string;
  source?: 'amazon' | 'local';
}

export interface CartItem {
  id: number;
  name: string;
  icon: string;
  store: string;
  price: number;
  photo?: string;
  productUrl?: string;
}

// ─── Raw shapes coming back from Spring Boot / RapidAPI ─────────────────────

// Best Buy
export interface BestBuyProductRaw {
  sku: string;
  name: string;
  regularPrice: number;
  salePrice: number;
  image: string;
  url: string;
  customerReviewAverage: number;
  customerReviewCount: number;
  shortDescription: string;
  onlineAvailability: boolean;
}

export interface BestBuySearchResponse {
  products: BestBuyProductRaw[];
  total: number;
}


export interface AmazonProductRaw {
  asin: string;
  product_title: string;
  product_price: string;
  product_original_price: string;
  product_star_rating: string;
  product_num_ratings: number;
  product_photo: string;
  product_url: string;
  is_prime: boolean;
  sales_volume: string;
  product_category?: string;
}

export interface SearchApiResponse {
  status: string;
  data: {
    total_products: number;
    country: string;
    products: AmazonProductRaw[];
  };
}

export interface OfferRaw {
  seller_name: string;
  price: string;
  is_prime?: boolean;
}

export interface OffersApiResponse {
  status: string;
  data: {
    asin: string;
    product_offers: OfferRaw[];
  };
}
