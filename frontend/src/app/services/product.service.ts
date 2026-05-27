import { Injectable, signal, computed } from '@angular/core';
import { Product, Price } from '../models/product.model';

const SEED_PRODUCTS: Product[] = [
  { id: 1,  name: 'MacBook Pro 14"',         cat: 'electronics', icon: '💻', desc: 'Apple M3 chip, 16GB RAM, 512GB SSD',               prices: [{ s: 'Amazon', p: 1899 }, { s: 'Best Buy', p: 1949 }, { s: 'Walmart', p: 1879 }, { s: 'B&H', p: 1869 }] },
  { id: 2,  name: 'Sony WH-1000XM5',         cat: 'electronics', icon: '🎧', desc: 'Noise cancelling headphones, 30hr battery',         prices: [{ s: 'Amazon', p: 279 },  { s: 'Best Buy', p: 299 },  { s: 'Sony Store', p: 349 }, { s: 'Walmart', p: 269 }] },
  { id: 3,  name: 'Samsung 65" QLED TV',     cat: 'electronics', icon: '📺', desc: '4K Smart TV, 120Hz, Quantum HDR',                   prices: [{ s: 'Amazon', p: 1099 }, { s: 'Best Buy', p: 1199 }, { s: 'Samsung', p: 1299 }, { s: 'Costco', p: 999 }] },
  { id: 4,  name: 'iPhone 16 Pro',           cat: 'electronics', icon: '📱', desc: 'A18 Pro, 256GB, titanium design',                   prices: [{ s: 'Apple', p: 999 },   { s: 'Amazon', p: 979 },   { s: 'Best Buy', p: 999 }, { s: 'Walmart', p: 969 }] },
  { id: 5,  name: 'Dyson V15 Vacuum',        cat: 'home',        icon: '🧹', desc: 'Cordless, laser detect, 60min runtime',             prices: [{ s: 'Amazon', p: 649 },  { s: 'Dyson', p: 749 },    { s: 'Best Buy', p: 699 }, { s: 'Target', p: 629 }] },
  { id: 6,  name: 'KitchenAid Mixer',        cat: 'home',        icon: '🥣', desc: '5.5 Qt stand mixer, 10 speeds',                    prices: [{ s: 'Amazon', p: 329 },  { s: 'Williams-Sonoma', p: 449 }, { s: 'Target', p: 349 }, { s: 'Walmart', p: 319 }] },
  { id: 7,  name: 'Nike Air Max 270',        cat: 'fashion',     icon: '👟', desc: "Men's running shoe, breathable mesh",               prices: [{ s: 'Nike', p: 150 },    { s: 'Amazon', p: 129 },   { s: 'Foot Locker', p: 145 }, { s: "DICK'S", p: 139 }] },
  { id: 8,  name: "Levi's 501 Jeans",        cat: 'fashion',     icon: '👖', desc: 'Original fit, 100% cotton denim',                  prices: [{ s: "Levi's", p: 89 },   { s: 'Amazon', p: 69 },    { s: "Macy's", p: 79 }, { s: 'Target', p: 65 }] },
  { id: 9,  name: 'Peloton Bike+',           cat: 'sports',      icon: '🚴', desc: 'Auto-resistance, 24" rotating screen',             prices: [{ s: 'Peloton', p: 2495 },{ s: 'Amazon', p: 2299 },  { s: 'Best Buy', p: 2399 }, { s: "Dick's", p: 2349 }] },
  { id: 10, name: 'Garmin Forerunner 265',   cat: 'sports',      icon: '⌚', desc: 'GPS running watch, AMOLED display',                prices: [{ s: 'Amazon', p: 349 },  { s: 'Garmin', p: 399 },   { s: 'Best Buy', p: 379 }, { s: 'REI', p: 359 }] },
  { id: 11, name: 'Instant Pot Duo',         cat: 'home',        icon: '🍲', desc: '6 Qt pressure cooker, 7-in-1 functions',           prices: [{ s: 'Amazon', p: 79 },   { s: 'Target', p: 89 },    { s: 'Walmart', p: 75 }, { s: 'Best Buy', p: 84 }] },
  { id: 12, name: 'iPad Air M2',             cat: 'electronics', icon: '📲', desc: '11" Liquid Retina, 256GB Wi-Fi',                   prices: [{ s: 'Apple', p: 749 },   { s: 'Amazon', p: 729 },   { s: 'Best Buy', p: 749 }, { s: 'Costco', p: 719 }] },
];

@Injectable({ providedIn: 'root' })
export class ProductService {
  private _seedProducts = signal<Product[]>(SEED_PRODUCTS);
  private _extraProducts = signal<Product[]>([]);

  readonly searchQuery = signal('');
  readonly activeCategory = signal('all');
  readonly sortBy = signal<'name' | 'low' | 'high'>('name');

  readonly allProducts = computed(() => [...this._seedProducts(), ...this._extraProducts()]);

  readonly filteredProducts = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const cat = this.activeCategory();
    const sort = this.sortBy();

    let list = this.allProducts().filter(p => {
      const matchCat = cat === 'all' || p.cat === cat;
      const matchQ = !q || p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
      return matchCat && matchQ;
    });

    if (sort === 'low')  list = [...list].sort((a, b) => this.bestPrice(a.prices) - this.bestPrice(b.prices));
    if (sort === 'high') list = [...list].sort((a, b) => this.bestPrice(b.prices) - this.bestPrice(a.prices));
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));

    return list;
  });

  bestPrice(prices: Price[]): number {
    return Math.min(...prices.map(p => p.p));
  }

  bestDeal(prices: Price[]): Price {
    return prices.reduce((a, b) => a.p < b.p ? a : b);
  }

  addProduct(product: Omit<Product, 'id'>): void {
    const newProduct: Product = { ...product, id: Date.now() };
    this._extraProducts.update(list => [...list, newProduct]);
  }

  getById(id: number): Product | undefined {
    return this.allProducts().find(p => p.id === id);
  }
}
