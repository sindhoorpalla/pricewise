import { Injectable, signal, computed } from '@angular/core';
import { CartItem } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = signal<CartItem[]>([]);

  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().length);
  readonly total = computed(() => this._items().reduce((sum, item) => sum + item.price, 0));

  isInCart(id: number): boolean {
    return this._items().some(item => item.id === id);
  }

  add(item: CartItem): 'added' | 'already_exists' {
    if (this.isInCart(item.id)) return 'already_exists';
    this._items.update(list => [...list, item]);
    return 'added';
  }

  remove(id: number): void {
    this._items.update(list => list.filter(item => item.id !== id));
  }

  clear(): void {
    this._items.set([]);
  }
}
