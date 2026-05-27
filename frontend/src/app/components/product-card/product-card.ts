import { Component, input, output, inject, computed } from '@angular/core';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';
import { CompareService } from '../../services/compare.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css'
})
export class ProductCardComponent {
  readonly product = input.required<Product>();

  readonly compareToggled = output<void>();
  readonly cartToggled = output<void>();

  protected cartSvc = inject(CartService);
  protected compareSvc = inject(CompareService);
  protected productSvc = inject(ProductService);

  protected inCompare = computed(() => this.compareSvc.isInCompare(this.product().id));
  protected inCart = computed(() => this.cartSvc.isInCart(this.product().id));

  protected bestDeal = computed(() => this.productSvc.bestDeal(this.product().prices));
}
