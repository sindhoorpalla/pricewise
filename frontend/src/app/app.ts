import { Component, signal, inject } from '@angular/core';
import { NavbarComponent, Tab } from './components/navbar/navbar';
import { HeroComponent } from './components/hero/hero';
import { BrowseComponent } from './components/browse/browse';
import { CompareComponent } from './components/compare/compare';
import { CartComponent } from './components/cart/cart';
import { SellComponent } from './components/sell/sell';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NavbarComponent,
    HeroComponent,
    BrowseComponent,
    CompareComponent,
    CartComponent,
    SellComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected toastSvc = inject(ToastService);
  activeTab = signal<Tab>('browse');

  onTabChange(tab: Tab): void {
    this.activeTab.set(tab);
  }

  goToBrowse(): void {
    this.activeTab.set('browse');
  }
}
