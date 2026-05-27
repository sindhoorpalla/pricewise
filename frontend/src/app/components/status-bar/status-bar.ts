import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-status-bar',
  standalone: true,
  templateUrl: './status-bar.html',
  styleUrl: './status-bar.css'
})
export class StatusBarComponent implements OnInit {
  private http = inject(HttpClient);

  connected = signal(false);
  checking  = signal(true);

  ngOnInit(): void {
    this.http.get<any>('/api/health').subscribe({
      next:  () => { this.connected.set(true);  this.checking.set(false); },
      error: () => { this.connected.set(false); this.checking.set(false); }
    });
  }
}
