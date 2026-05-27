import { Component, inject, output } from '@angular/core';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class CartComponent {
  readonly browseTrigger = output<void>();

  protected cartSvc = inject(CartService);

  checkout(): void {
    const items = this.cartSvc.items().map(c => `${c.name} $${c.price}`).join(', ');
    alert(`Checkout flow coming soon!\n\nIn production this connects to Stripe.\n\nYour cart: ${items}`);
  }
}
