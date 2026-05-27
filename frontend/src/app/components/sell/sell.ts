import { Component, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-sell',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './sell.html',
  styleUrl: './sell.css'
})
export class SellComponent {
  readonly listSuccess = output<void>();

  protected productSvc = inject(ProductService);
  protected toastSvc = inject(ToastService);

  form = {
    name: '',
    cat: 'electronics',
    price: '',
    store: '',
    icon: '',
    desc: ''
  };

  readonly perks = [
    { icon: '💸', title: 'Zero listing fees',     desc: 'List as many products as you want for free. Only pay a small fee when you make a sale.' },
    { icon: '📊', title: 'Win on value',           desc: 'Shoppers see your price alongside competitors. Beat the price and win the sale.' },
    { icon: '🤖', title: 'AI-powered traffic',     desc: 'Our AI recommends the best deals to shoppers — great prices get featured automatically.' },
    { icon: '🌎', title: 'Reach USA-wide',         desc: 'Millions of price-conscious shoppers actively comparing before they buy.' },
  ];

  submit(): void {
    const { name, price, store, cat, icon, desc } = this.form;
    if (!name || !price || !store) {
      alert('Please fill in product name, price and store name.');
      return;
    }
    this.productSvc.addProduct({
      name,
      cat,
      icon: icon || '📦',
      desc: desc || 'Listed by seller',
      prices: [{ s: store, p: parseFloat(price) }]
    });
    this.toastSvc.show(`${name} listed successfully!`);
    this.form = { name: '', cat: 'electronics', price: '', store: '', icon: '', desc: '' };
    this.listSuccess.emit();
  }
}
