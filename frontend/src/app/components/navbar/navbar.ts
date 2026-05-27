import { Component, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { CompareService } from '../../services/compare.service';

export type Tab = 'browse' | 'compare' | 'cart' | 'sell';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  readonly tabChange = output<Tab>();

  protected productSvc = inject(ProductService);
  protected cartSvc    = inject(CartService);
  protected compareSvc = inject(CompareService);

  activeTab: Tab = 'browse';

  switchTab(tab: Tab): void {
    this.activeTab = tab;
    this.tabChange.emit(tab);
  }

  onSearch(): void {
    const q = this.productSvc.searchQuery().trim();
    if (!q) return;
    this.productSvc.searchAmazon(q);
    this.switchTab('browse');
  }

  clearSearch(): void {
    this.productSvc.clearSearch();
  }
}
