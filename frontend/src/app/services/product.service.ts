import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  Product, Price,
  AmazonProductRaw, SearchApiResponse, OffersApiResponse
} from '../models/product.model';

// Fallback data shown before the first search
const SEED_PRODUCTS: Product[] = [
  { id: 1,  name: 'MacBook Pro 14"',       cat: 'electronics', icon: '💻', desc: 'Apple M3 chip, 16GB RAM, 512GB SSD',         source: 'local', prices: [{ s: 'Amazon', p: 1899 }, { s: 'Best Buy', p: 1949 }, { s: 'Walmart', p: 1879 }, { s: 'B&H', p: 1869 }] },
  { id: 2,  name: 'Sony WH-1000XM5',       cat: 'electronics', icon: '🎧', desc: 'Noise cancelling headphones, 30hr battery',  source: 'local', prices: [{ s: 'Amazon', p: 279 },  { s: 'Best Buy', p: 299 },  { s: 'Sony Store', p: 349 }, { s: 'Walmart', p: 269 }] },
  { id: 3,  name: 'Samsung 65" QLED TV',   cat: 'electronics', icon: '📺', desc: '4K Smart TV, 120Hz, Quantum HDR',            source: 'local', prices: [{ s: 'Amazon', p: 1099 }, { s: 'Best Buy', p: 1199 }, { s: 'Samsung', p: 1299 }, { s: 'Costco', p: 999 }] },
  { id: 4,  name: 'iPhone 16 Pro',         cat: 'electronics', icon: '📱', desc: 'A18 Pro, 256GB, titanium design',            source: 'local', prices: [{ s: 'Apple', p: 999 },   { s: 'Amazon', p: 979 },   { s: 'Best Buy', p: 999 }, { s: 'Walmart', p: 969 }] },
  { id: 5,  name: 'Dyson V15 Vacuum',      cat: 'home',        icon: '🧹', desc: 'Cordless, laser detect, 60min runtime',      source: 'local', prices: [{ s: 'Amazon', p: 649 },  { s: 'Dyson', p: 749 },    { s: 'Best Buy', p: 699 }, { s: 'Target', p: 629 }] },
  { id: 6,  name: 'KitchenAid Mixer',      cat: 'home',        icon: '🥣', desc: '5.5 Qt stand mixer, 10 speeds',             source: 'local', prices: [{ s: 'Amazon', p: 329 },  { s: 'Williams-Sonoma', p: 449 }, { s: 'Target', p: 349 }, { s: 'Walmart', p: 319 }] },
  { id: 7,  name: 'Nike Air Max 270',      cat: 'fashion',     icon: '👟', desc: "Men's running shoe, breathable mesh",        source: 'local', prices: [{ s: 'Nike', p: 150 },    { s: 'Amazon', p: 129 },   { s: 'Foot Locker', p: 145 }, { s: "DICK'S", p: 139 }] },
  { id: 8,  name: "Levi's 501 Jeans",      cat: 'fashion',     icon: '👖', desc: 'Original fit, 100% cotton denim',           source: 'local', prices: [{ s: "Levi's", p: 89 },   { s: 'Amazon', p: 69 },    { s: "Macy's", p: 79 }, { s: 'Target', p: 65 }] },
  { id: 9,  name: 'Peloton Bike+',         cat: 'sports',      icon: '🚴', desc: 'Auto-resistance, 24" rotating screen',      source: 'local', prices: [{ s: 'Peloton', p: 2495 },{ s: 'Amazon', p: 2299 },  { s: 'Best Buy', p: 2399 }, { s: "Dick's", p: 2349 }] },
  { id: 10, name: 'Garmin Forerunner 265', cat: 'sports',      icon: '⌚', desc: 'GPS running watch, AMOLED display',         source: 'local', prices: [{ s: 'Amazon', p: 349 },  { s: 'Garmin', p: 399 },   { s: 'Best Buy', p: 379 }, { s: 'REI', p: 359 }] },
  { id: 11, name: 'Instant Pot Duo',       cat: 'home',        icon: '🍲', desc: '6 Qt pressure cooker, 7-in-1 functions',   source: 'local', prices: [{ s: 'Amazon', p: 79 },   { s: 'Target', p: 89 },    { s: 'Walmart', p: 75 }, { s: 'Best Buy', p: 84 }] },
  { id: 12, name: 'iPad Air M2',           cat: 'electronics', icon: '📲', desc: '11" Liquid Retina, 256GB Wi-Fi',            source: 'local', prices: [{ s: 'Apple', p: 749 },   { s: 'Amazon', p: 729 },   { s: 'Best Buy', p: 749 }, { s: 'Costco', p: 719 }] },
];

const API_BASE = '/api';  // proxied to Spring Boot :8080 in dev; same origin in prod

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);

  private _seedProducts  = signal<Product[]>(SEED_PRODUCTS);
  private _extraProducts = signal<Product[]>([]);
  private _amazonResults = signal<Product[]>([]);

  readonly searchQuery     = signal('');
  readonly activeCategory  = signal('all');
  readonly sortBy          = signal<'name' | 'low' | 'high'>('name');
  readonly isLoading       = signal(false);
  readonly searchError     = signal('');
  readonly isLiveSearch    = signal(false);   // true once user has searched

  readonly allProducts = computed(() => [
    ...this._seedProducts(),
    ...this._extraProducts()
  ]);

  /** Products shown in the Browse grid */
  readonly filteredProducts = computed(() => {
    const live = this.isLiveSearch();
    const list = live ? this._amazonResults() : this._localFiltered();
    return this._sorted(list);
  });

  // ── Public API ────────────────────────────────────────────────────────────

  /** Called when user submits a search query */
  async searchAmazon(query: string): Promise<void> {
    if (!query.trim()) {
      this.isLiveSearch.set(false);
      this._amazonResults.set([]);
      return;
    }
    this.isLoading.set(true);
    this.searchError.set('');
    try {
      const res = await firstValueFrom(
        this.http.get<SearchApiResponse>(`${API_BASE}/search?q=${encodeURIComponent(query)}`)
      );
      const mapped = (res.data?.products ?? []).map(r => this._mapRaw(r));
      this._amazonResults.set(mapped);
      this.isLiveSearch.set(true);
    } catch (e: any) {
      this.searchError.set('Could not fetch Amazon data. Showing local results.');
      this.isLiveSearch.set(false);
    } finally {
      this.isLoading.set(false);
    }
  }

  /** Load multi-seller offers for the Compare view */
  async loadOffers(asin: string, productId: number): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.get<OffersApiResponse>(`${API_BASE}/offers/${asin}`)
      );
      const offers: Price[] = (res.data?.product_offers ?? [])
        .filter(o => o.price)
        .map(o => ({ s: o.seller_name || 'Amazon', p: this._parsePrice(o.price) }))
        .filter(o => o.p > 0);

      if (!offers.length) return;

      // Merge offers into the existing amazon result
      this._amazonResults.update(list =>
        list.map(p => p.id === productId ? { ...p, prices: offers } : p)
      );
    } catch { /* silently ignore — existing price still shows */ }
  }

  bestPrice(prices: Price[]): number {
    return Math.min(...prices.map(p => p.p));
  }

  bestDeal(prices: Price[]): Price {
    return prices.reduce((a, b) => a.p < b.p ? a : b);
  }

  addProduct(product: Omit<Product, 'id'>): void {
    const newProduct: Product = { ...product, id: Date.now(), source: 'local' };
    this._extraProducts.update(list => [...list, newProduct]);
  }

  getById(id: number): Product | undefined {
    return [
      ...this._amazonResults(),
      ...this.allProducts()
    ].find(p => p.id === id);
  }

  clearSearch(): void {
    this.isLiveSearch.set(false);
    this._amazonResults.set([]);
    this.searchQuery.set('');
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private _localFiltered(): Product[] {
    const q   = this.searchQuery().toLowerCase();
    const cat = this.activeCategory();
    return this.allProducts().filter(p => {
      const matchCat = cat === 'all' || p.cat === cat;
      const matchQ   = !q || p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }

  private _sorted(list: Product[]): Product[] {
    const sort = this.sortBy();
    if (sort === 'low')  return [...list].sort((a, b) => this.bestPrice(a.prices) - this.bestPrice(b.prices));
    if (sort === 'high') return [...list].sort((a, b) => this.bestPrice(b.prices) - this.bestPrice(a.prices));
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }

  private _mapRaw(r: AmazonProductRaw): Product {
    const price = this._parsePrice(r.product_price);
    return {
      id:          this._hashAsin(r.asin),
      name:        r.product_title?.slice(0, 80) ?? 'Unknown',
      cat:         'electronics',                    // Amazon search is generic
      icon:        '🛒',
      desc:        r.sales_volume ? `${r.sales_volume} sold` : (r.product_star_rating ? `★ ${r.product_star_rating}` : ''),
      source:      'amazon',
      asin:        r.asin,
      photo:       r.product_photo,
      productUrl:  r.product_url,
      rating:      r.product_star_rating,
      numRatings:  r.product_num_ratings,
      isPrime:     r.is_prime,
      salesVolume: r.sales_volume,
      prices:      price > 0
        ? [{ s: 'Amazon', p: price }]
        : [{ s: 'Amazon', p: 0 }],
    };
  }

  private _parsePrice(raw: string | undefined): number {
    if (!raw) return 0;
    const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  }

  /** Stable numeric id from ASIN string */
  private _hashAsin(asin: string): number {
    let h = 0;
    for (const c of asin) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0;
    return Math.abs(h);
  }
}
