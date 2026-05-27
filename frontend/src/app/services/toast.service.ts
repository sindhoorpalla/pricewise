import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly message = signal('');
  readonly visible = signal(false);

  private timer: ReturnType<typeof setTimeout> | null = null;

  show(msg: string): void {
    if (this.timer) clearTimeout(this.timer);
    this.message.set(msg);
    this.visible.set(true);
    this.timer = setTimeout(() => this.visible.set(false), 2500);
  }
}
