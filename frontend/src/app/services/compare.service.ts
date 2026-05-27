import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CompareService {
  private _ids = signal<number[]>([]);

  readonly ids = this._ids.asReadonly();
  readonly count = computed(() => this._ids().length);

  isInCompare(id: number): boolean {
    return this._ids().includes(id);
  }

  toggle(id: number): 'added' | 'removed' | 'max_reached' {
    if (this._ids().includes(id)) {
      this._ids.update(list => list.filter(i => i !== id));
      return 'removed';
    }
    if (this._ids().length >= 4) return 'max_reached';
    this._ids.update(list => [...list, id]);
    return 'added';
  }

  clear(): void {
    this._ids.set([]);
  }
}
