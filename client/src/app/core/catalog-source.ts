export interface CatalogSource {
  getProducts(): Promise<readonly unknown[]>;
  getOrders(): Promise<readonly unknown[]>;
}

export const DEMO_PRODUCTS = Object.freeze([
  { id: 1, name: 'Royal Floral Saree Border', category: 'Saree Embroidery', priceType: 'QuoteOnly' },
  { id: 2, name: 'Peacock Bridal Blouse', category: 'Blouse Embroidery', priceType: 'QuoteOnly' },
  { id: 3, name: 'Company Logo Stitching', category: 'T-Shirt Logo Embroidery', priceType: 'QuoteOnly' }
]);

export class DemoCatalogSource implements CatalogSource {
  async getProducts() { return DEMO_PRODUCTS; }
  async getOrders() { return [{ orderNumber: 'SEW-1001', status: 'DesignFinalized' }]; }
}
