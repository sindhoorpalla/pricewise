import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  Product, Price,
  AmazonProductRaw, SearchApiResponse,
  BestBuyProductRaw, BestBuySearchResponse,
  TargetProductRaw, TargetSearchResponse,
  OffersApiResponse
} from '../models/product.model';

const SEED_PRODUCTS: Product[] = [
  { id: 1,  name: 'MacBook Pro 14"',       cat: 'electronics', icon: '💻', desc: 'Apple M3 chip, 16GB RAM, 512GB SSD',         source: 'local', prices: [{ s: 'Amazon', p: 1899 }, { s: 'Best Buy', p: 1949 }, { s: 'Walmart', p: 1879 }] },
  { id: 2,  name: 'Sony WH-1000XM5',       cat: 'electronics', icon: '🎧', desc: 'Noise cancelling headphones, 30hr battery',  source: 'local', prices: [{ s: 'Amazon', p: 279 },  { s: 'Best Buy', p: 299 },  { s: 'Walmart', p: 269 }] },
  { id: 3,  name: 'Samsung 65" QLED TV',   cat: 'electronics', icon: '📺', desc: '4K Smart TV, 120Hz, Quantum HDR',            source: 'local', prices: [{ s: 'Amazon', p: 1099 }, { s: 'Best Buy', p: 1199 }, { s: 'Costco', p: 999 }] },
  { id: 4,  name: 'iPhone 16 Pro',         cat: 'electronics', icon: '📱', desc: 'A18 Pro, 256GB, titanium design',            source: 'local', prices: [{ s: 'Amazon', p: 979 },  { s: 'Best Buy', p: 999 },  { s: 'Walmart', p: 969 }] },
  { id: 5,  name: 'Dyson V15 Vacuum',      cat: 'home',        icon: '🧹', desc: 'Cordless, laser detect, 60min runtime',      source: 'local', prices: [{ s: 'Amazon', p: 649 },  { s: 'Best Buy', p: 699 },  { s: 'Target', p: 629 }] },
  { id: 6,  name: 'KitchenAid Mixer',      cat: 'home',        icon: '🥣', desc: '5.5 Qt stand mixer, 10 speeds',             source: 'local', prices: [{ s: 'Amazon', p: 329 },  { s: 'Best Buy', p: 349 },  { s: 'Walmart', p: 319 }] },
  { id: 7,  name: 'Nike Air Max 270',      cat: 'fashion',     icon: '👟', desc: "Men's running shoe, breathable mesh",        source: 'local', prices: [{ s: 'Amazon', p: 129 },  { s: 'Best Buy', p: 145 }] },
  { id: 8,  name: "Levi's 501 Jeans",      cat: 'fashion',     icon: '👖', desc: 'Original fit, 100% cotton denim',           source: 'local', prices: [{ s: 'Amazon', p: 69 },   { s: 'Target', p: 65 }] },
  { id: 9,  name: 'Peloton Bike+',         cat: 'sports',      icon: '🚴', desc: 'Auto-resistance, 24" rotating screen',      source: 'local', prices: [{ s: 'Amazon', p: 2299 }, { s: 'Best Buy', p: 2399 }] },
  { id: 10, name: 'Garmin Forerunner 265', cat: 'sports',      icon: '⌚', desc: 'GPS running watch, AMOLED display',         source: 'local', prices: [{ s: 'Amazon', p: 349 },  { s: 'Best Buy', p: 379 },  { s: 'REI', p: 359 }] },
  { id: 11, name: 'Instant Pot Duo',       cat: 'home',        icon: '🍲', desc: '6 Qt pressure cooker, 7-in-1 functions',   source: 'local', prices: [{ s: 'Amazon', p: 79 },   { s: 'Best Buy', p: 84 },   { s: 'Walmart', p: 75 }] },
  { id: 12, name: 'iPad Air M2',           cat: 'electronics', icon: '📲', desc: '11" Liquid Retina, 256GB Wi-Fi',            source: 'local', prices: [{ s: 'Amazon', p: 729 },  { s: 'Best Buy', p: 749 },  { s: 'Costco', p: 719 }] },
];

const API_BASE = '/api';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);

  private _seedProducts  = signal<Product[]>(SEED_PRODUCTS);
  private _extraProducts = signal<Product[]>([]);
  private _liveResults   = signal<Product[]>([]);

  readonly searchQuery    = signal('');
  readonly activeCategory = signal('trending');
  readonly sortBy         = signal<'name' | 'low' | 'high'>('name');
  readonly isLoading      = signal(false);
  readonly searchError    = signal('');
  readonly isLiveSearch   = signal(false);

  readonly allProducts = computed(() => [...this._seedProducts(), ...this._extraProducts()]);

  readonly filteredProducts = computed(() => {
    const list = this.isLiveSearch() ? this._liveResults() : this._localFiltered();
    return this._sorted(list);
  });

  // ── Public API ─────────────────────────────────────────────────────────────

  async searchBoth(query: string): Promise<void> {
    if (!query.trim()) { this.isLiveSearch.set(false); this._liveResults.set([]); return; }

    this.isLoading.set(true);
    this.searchError.set('');

    // Fire Amazon + Best Buy + Target in parallel
    const [amazonResult, bestBuyResult, targetResult] = await Promise.allSettled([
      this._fetchAmazon(query),
      this._fetchBestBuy(query),
      this._fetchTarget(query),
    ]);

    const amazonProducts  = amazonResult.status  === 'fulfilled' ? amazonResult.value  : [];
    const bestBuyProducts = bestBuyResult.status === 'fulfilled' ? bestBuyResult.value : [];
    const targetProducts  = targetResult.status  === 'fulfilled' ? targetResult.value  : [];

    const errors: string[] = [];
    if (amazonResult.status  === 'rejected') errors.push('Amazon');
    if (bestBuyResult.status === 'rejected') errors.push('Best Buy');
    if (targetResult.status  === 'rejected') errors.push('Target');
    if (errors.length) this.searchError.set(`${errors.join(', ')} data unavailable.`);

    // Merge all three sources
    const merged = this._mergeResults(amazonProducts, bestBuyProducts, targetProducts);
    this._liveResults.set(merged);
    this.isLiveSearch.set(true);
    this.isLoading.set(false);
  }

  // Kept for backward compat (navbar search)
  async searchAmazon(query: string): Promise<void> {
    return this.searchBoth(query);
  }

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
      this._liveResults.update(list =>
        list.map(p => p.id === productId ? { ...p, prices: offers } : p)
      );
    } catch { /* silently ignore */ }
  }

  bestPrice(prices: Price[]): number {
    const valid = prices.filter(p => p.p > 0);
    return valid.length ? Math.min(...valid.map(p => p.p)) : 0;
  }

  bestDeal(prices: Price[]): Price {
    const valid = prices.filter(p => p.p > 0);
    return valid.length ? valid.reduce((a, b) => a.p < b.p ? a : b) : prices[0];
  }

  addProduct(product: Omit<Product, 'id'>): void {
    this._extraProducts.update(list => [...list, { ...product, id: Date.now(), source: 'local' }]);
  }

  getById(id: number): Product | undefined {
    return [...this._liveResults(), ...this.allProducts()].find(p => p.id === id);
  }

  clearSearch(): void {
    this.isLiveSearch.set(false);
    this._liveResults.set([]);
    this.searchQuery.set('');
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private async _fetchAmazon(query: string): Promise<Product[]> {
    const res = await firstValueFrom(
      this.http.get<SearchApiResponse>(`${API_BASE}/search?q=${encodeURIComponent(query)}`)
    );
    return (res.data?.products ?? []).map(r => this._mapAmazon(r));
  }

  private async _fetchBestBuy(query: string): Promise<Product[]> {
    const res = await firstValueFrom(
      this.http.get<BestBuySearchResponse>(`${API_BASE}/bestbuy/search?q=${encodeURIComponent(query)}`)
    );
    return (res.products ?? []).map(r => this._mapBestBuy(r));
  }

  private async _fetchTarget(query: string): Promise<Product[]> {
    const res = await firstValueFrom(
      this.http.get<TargetSearchResponse>(`${API_BASE}/target/search?q=${encodeURIComponent(query)}`)
    );
    return (res.products ?? []).map(r => this._mapTarget(r));
  }

  /**
   * Merge Amazon (primary), Best Buy, and Target results.
   * Matching products share a card with all available prices shown.
   */
  private _mergeResults(amazon: Product[], bestBuy: Product[], target: Product[]): Product[] {
    const merged = amazon.map(ap => ({ ...ap }));

    const attachPrice = (sources: Product[], storeName: string) => {
      const unmatched: Product[] = [];
      for (const sp of sources) {
        const spName = sp.name.toLowerCase();
        const match = merged.find(ap => {
          const words = spName.split(' ').filter(w => w.length > 3);
          return words.filter(w => ap.name.toLowerCase().includes(w)).length >= 2;
        });
        if (match) {
          const price = sp.prices[0];
          if (price && price.p > 0 && !match.prices.find(p => p.s === storeName)) {
            match.prices = [...match.prices, price];
          }
        } else {
          unmatched.push(sp);
        }
      }
      merged.push(...unmatched);
    };

    attachPrice(bestBuy, 'Best Buy');
    attachPrice(target, 'Target');
    return merged;
  }

  private _localFiltered(): Product[] {
    const q   = this.searchQuery().toLowerCase();
    const cat = this.activeCategory();
    return this.allProducts().filter(p => {
      const matchCat = !cat || cat === 'all' || p.cat === cat;
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

  private _mapAmazon(r: AmazonProductRaw): Product {
    const price = this._parsePrice(r.product_price);
    return {
      id:         this._hash(r.asin),
      name:       r.product_title?.slice(0, 80) ?? 'Unknown',
      cat:        'electronics',
      icon:       '🛒',
      desc:       r.sales_volume ? `${r.sales_volume} sold` : '',
      source:     'amazon',
      asin:       r.asin,
      photo:      r.product_photo,
      productUrl: r.product_url,
      rating:     r.product_star_rating,
      numRatings: r.product_num_ratings,
      isPrime:    r.is_prime,
      salesVolume:r.sales_volume,
      prices:     [{ s: 'Amazon', p: price }],
    };
  }

  private _mapTarget(r: TargetProductRaw): Product {
    return {
      id:         this._hash('tgt_' + r.tcin),
      name:       r.title?.slice(0, 80) ?? 'Target Product',
      cat:        'electronics',
      icon:       '🎯',
      desc:       '',
      source:     'amazon',
      photo:      r.imageUrl,
      productUrl: r.buyUrl,
      rating:     r.rating?.toString(),
      numRatings: r.reviewCount,
      prices:     [{ s: 'Target', p: r.price ?? 0 }],
    };
  }

  private _mapBestBuy(r: BestBuyProductRaw): Product {
    const price = r.salePrice ?? r.regularPrice ?? 0;
    return {
      id:         this._hash('bb_' + r.sku),
      name:       r.name?.slice(0, 80) ?? 'Unknown',
      cat:        'electronics',
      icon:       '🛒',
      desc:       r.shortDescription?.slice(0, 80) ?? '',
      source:     'amazon',   // treated same for display
      photo:      r.image,
      productUrl: r.url ? `https://www.bestbuy.com${r.url}` : undefined,
      rating:     r.customerReviewAverage?.toString(),
      numRatings: r.customerReviewCount,
      prices:     [{ s: 'Best Buy', p: price }],
    };
  }

  private _parsePrice(raw: string | undefined): number {
    if (!raw) return 0;
    const num = parseFloat(String(raw).replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  }

  private _hash(str: string): number {
    let h = 0;
    for (const c of str) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0;
    return Math.abs(h);
  }
}
