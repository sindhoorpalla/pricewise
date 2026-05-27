import { Component, inject, output } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { CompareService } from '../../services/compare.service';
import { ToastService } from '../../services/toast.service';
import { ProductCardComponent } from '../product-card/product-card';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [ProductCardComponent],
  templateUrl: './browse.html',
  styleUrl: './browse.css'
})
export class BrowseComponent {
  readonly goToCompare = output<void>();

  protected productSvc = inject(ProductService);
  protected cartSvc = inject(CartService);
  protected compareSvc = inject(CompareService);
  protected toastSvc = inject(ToastService);

  readonly categories = [
    { key: 'all',         label: 'All' },
    { key: 'electronics', label: '💻 Electronics' },
    { key: 'home',        label: '🏠 Home' },
    { key: 'fashion',     label: '👗 Fashion' },
    { key: 'sports',      label: '🏃 Sports' },
  ];

  setCategory(cat: string): void {
    this.productSvc.activeCategory.set(cat);
  }

  setSort(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as 'name' | 'low' | 'high';
    this.productSvc.sortBy.set(val);
  }

  toggleCompare(product: Product): void {
    const result = this.compareSvc.toggle(product.id);
    if (result === 'added')       this.toastSvc.show('Added to compare!');
    if (result === 'max_reached') this.toastSvc.show('Max 4 products to compare');
  }

  addToCart(product: Product): void {
    const best = this.productSvc.bestDeal(product.prices);
    const result = this.cartSvc.add({ id: product.id, name: product.name, icon: product.icon, store: best.s, price: best.p });
    if (result === 'added')          this.toastSvc.show(`${product.name} added to cart!`);
    if (result === 'already_exists') this.toastSvc.show('Already in cart!');
  }
}
