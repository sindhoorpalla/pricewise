import { Component, inject, signal } from '@angular/core';
import { CompareService } from '../../services/compare.service';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { computed } from '@angular/core';

@Component({
  selector: 'app-compare',
  standalone: true,
  templateUrl: './compare.html',
  styleUrl: './compare.css'
})
export class CompareComponent {
  protected compareSvc = inject(CompareService);
  protected productSvc = inject(ProductService);
  protected cartSvc = inject(CartService);
  protected toastSvc = inject(ToastService);

  aiText = signal('');
  aiLoading = signal(false);
  aiVisible = signal(false);

  protected compareProducts = computed(() =>
    this.compareSvc.ids().map(id => this.productSvc.getById(id)!).filter(Boolean)
  );

  protected allStores = computed(() => {
    const prods = this.compareProducts();
    return [...new Set(prods.flatMap(p => p.prices.map(pr => pr.s)))].slice(0, 5);
  });

  protected lowestTotal = computed(() => {
    const prods = this.compareProducts();
    if (!prods.length) return 0;
    return Math.min(...prods.map(p => this.productSvc.bestPrice(p.prices)));
  });

  priceForStore(productId: number, store: string): number | null {
    const p = this.productSvc.getById(productId);
    const found = p?.prices.find(pr => pr.s === store);
    return found?.p ?? null;
  }

  addToCart(id: number): void {
    const p = this.productSvc.getById(id);
    if (!p) return;
    const best = this.productSvc.bestDeal(p.prices);
    const result = this.cartSvc.add({ id: p.id, name: p.name, icon: p.icon, store: best.s, price: best.p });
    if (result === 'added')          this.toastSvc.show(`${p.name} added to cart!`);
    if (result === 'already_exists') this.toastSvc.show('Already in cart!');
  }

  async aiRecommend(): Promise<void> {
    const prods = this.compareProducts();
    this.aiVisible.set(true);
    this.aiLoading.set(true);
    this.aiText.set('');

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 400,
          messages: [{
            role: 'user',
            content: `Compare these products briefly and recommend the best one to buy. 3-4 sentences, focus on value for money:\n${prods.map(p => `${p.name}: best $${this.productSvc.bestPrice(p.prices)} at ${this.productSvc.bestDeal(p.prices).s}. ${p.desc}`).join('\n')}`
          }]
        })
      });
      const data = await res.json();
      this.aiText.set(data.content?.map((c: any) => c.text || '').join('') || 'Could not generate.');
    } catch {
      this.aiText.set('Error — please try again.');
    } finally {
      this.aiLoading.set(false);
    }
  }
}
