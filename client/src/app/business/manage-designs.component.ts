import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Design {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  isActive: boolean;
}

type DesignDraft = Omit<Design, 'id'> & { id?: string };

@Component({
  selector: 'app-manage-designs', standalone: true, imports: [CommonModule, FormsModule],
  templateUrl: './manage-designs.component.html', styleUrl: './manage-designs.component.scss'
})
export class ManageDesignsComponent {
  readonly categories = ['Saree Embroidery', 'Blouse Embroidery', 'Bridal Embroidery', 'T-Shirt Logo', 'Uniform Embroidery', 'Cap Embroidery', 'Bag Embroidery'];
  readonly designs = signal<Design[]>([]);
  readonly error = signal('');
  readonly loading = signal(false);
  readonly reading = signal(false);
  readonly saving = signal(false);
  readonly message = signal('');
  draft: DesignDraft | null = null;
  imagePreview = '';
  private selectedImage: File | null = null;
  private imageVersion = 0;
  private readonly designsUrl = `${environment.apiBaseUrl}/designs`;

  constructor(private readonly http: HttpClient) { void this.load(); }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      this.designs.set(await firstValueFrom(this.http.get<Design[]>(`${this.designsUrl}/admin`)));
    } catch {
      this.error.set('Could not load designs. Check that the backend is running and try again.');
    } finally {
      this.loading.set(false);
    }
  }

  add(): void {
    this.resetImageSelection();
    this.error.set('');
    this.message.set('');
    this.draft = { name: '', category: this.categories[0], price: 0, imageUrl: '', isActive: true };
  }

  edit(design: Design): void {
    this.resetImageSelection();
    this.error.set('');
    this.message.set('');
    this.draft = { ...design };
    this.imagePreview = design.imageUrl;
  }

  cancel(): void {
    this.resetImageSelection();
    this.draft = null;
    this.error.set('');
  }

  async selectImage(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || !this.draft) return;

    const version = ++this.imageVersion;
    this.error.set('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      this.reading.set(false);
      this.error.set('Choose a JPG, PNG or WebP image up to 5 MB.');
      return;
    }

    this.reading.set(true);
    try {
      const previewUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Image could not be read.'));
        reader.readAsDataURL(file);
      });
      if (version === this.imageVersion && this.draft) {
        this.selectedImage = file;
        this.imagePreview = previewUrl;
      }
    } catch {
      if (version === this.imageVersion) this.error.set('This image could not be opened. Choose another image.');
    } finally {
      if (version === this.imageVersion) this.reading.set(false);
    }
  }

  async save(): Promise<void> {
    if (!this.draft || this.reading() || this.saving()) return;
    const draft = { ...this.draft, name: this.draft.name.trim() };
    if (!draft.name || !this.categories.includes(draft.category) || !Number.isFinite(draft.price) || draft.price < 0 || (!this.selectedImage && !draft.imageUrl)) {
      this.error.set('Enter a name, category, valid price and image.');
      return;
    }

    this.saving.set(true);
    this.error.set('');
    this.message.set('');
    try {
      let imageUrl = draft.imageUrl;
      if (this.selectedImage) imageUrl = await this.upload(this.selectedImage);

      const payload = { name: draft.name, category: draft.category, price: draft.price, imageUrl, isActive: draft.isActive };
      if (draft.id) await firstValueFrom(this.http.put(`${this.designsUrl}/${draft.id}`, payload));
      else await firstValueFrom(this.http.post(this.designsUrl, payload));

      this.resetImageSelection();
      this.draft = null;
      await this.load();
      this.message.set('Design saved.');
    } catch {
      this.error.set('Could not save the design. Check the backend connection and try again.');
    } finally {
      this.saving.set(false);
    }
  }

  async toggle(design: Design): Promise<void> {
    if (design.isActive && !window.confirm(`Hide “${design.name}” from the customer catalog?`)) return;
    await this.changeAndRefresh(
      firstValueFrom(this.http.patch(`${this.designsUrl}/${design.id}/visibility`, { isActive: !design.isActive })),
      design.isActive ? 'Design hidden.' : 'Design published.'
    );
  }

  async remove(design: Design): Promise<void> {
    if (!window.confirm(`Delete “${design.name}”? This cannot be undone.`)) return;
    const changed = await this.changeAndRefresh(firstValueFrom(this.http.delete(`${this.designsUrl}/${design.id}`)), 'Design deleted.');
    if (changed && this.draft?.id === design.id) this.cancel();
  }

  private async upload(file: File): Promise<string> {
    const body = new FormData();
    body.append('file', file);
    const response = await firstValueFrom(this.http.post<{ imageUrl: string }>(`${this.designsUrl}/upload`, body));
    return response.imageUrl;
  }

  private async changeAndRefresh(request: Promise<unknown>, successMessage: string): Promise<boolean> {
    if (this.saving()) return false;
    this.saving.set(true);
    this.error.set('');
    this.message.set('');
    try {
      await request;
      await this.load();
      this.message.set(successMessage);
      return true;
    } catch {
      this.error.set('Could not save the change. Check the backend connection and try again.');
      return false;
    } finally {
      this.saving.set(false);
    }
  }

  private resetImageSelection(): void {
    this.imageVersion++;
    this.reading.set(false);
    this.selectedImage = null;
    this.imagePreview = '';
  }
}
