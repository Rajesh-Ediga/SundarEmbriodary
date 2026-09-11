import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('Sundar Embroidery Works');
  protected readonly stats = [
    { label: 'Total Designs', value: 8 }, { label: 'Active Designs', value: 8 },
    { label: 'New Enquiries', value: 0 }, { label: 'New Orders', value: 0 },
    { label: 'In Production', value: 0 }, { label: 'Bulk Requests', value: 0 }
  ];
}
