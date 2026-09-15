import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../environments/environment';
import { ManageDesignsComponent } from './manage-designs.component';
import { BusinessAuthService } from './business-auth.service';

interface Enquiry {
  id: string;
  customerName: string;
  phoneNumber: string;
  designId?: string | null;
  quantity: number;
  enquiryType: string;
  requiredDate?: string | null;
  notes?: string | null;
  referenceImageUrl?: string | null;
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-business-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ManageDesignsComponent
  ],
  templateUrl: './business-dashboard.component.html',
  styleUrl: './business-dashboard.component.scss'
})
export class BusinessDashboardComponent implements OnInit {

  enquiries: Enquiry[] = [];

  loadingEnquiries = false;

  enquiryError = '';

  readonly statuses = [
    'New',
    'Contacted',
    'Quoted',
    'Closed'
  ];

  private readonly enquiriesUrl =
    `${environment.apiBaseUrl}/enquiries`;

  constructor(
    private readonly auth: BusinessAuthService,
    private readonly router: Router,
    private readonly http: HttpClient,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    void this.loadEnquiries();
  }

  get newEnquiriesCount(): number {
    return this.enquiries.filter(
      enquiry => enquiry.status === 'New'
    ).length;
  }

  get contactedCount(): number {
    return this.enquiries.filter(
      enquiry => enquiry.status === 'Contacted'
    ).length;
  }

  get quotedCount(): number {
    return this.enquiries.filter(
      enquiry => enquiry.status === 'Quoted'
    ).length;
  }

  get closedCount(): number {
    return this.enquiries.filter(
      enquiry => enquiry.status === 'Closed'
    ).length;
  }

  async loadEnquiries(): Promise<void> {

    this.loadingEnquiries = true;
    this.enquiryError = '';

    try {

      console.log(
        'Calling enquiry API:',
        `${this.enquiriesUrl}/admin`
      );

      const response = await firstValueFrom(
        this.http.get<Enquiry[]>(
          `${this.enquiriesUrl}/admin`
        )
      );

      console.log(
        'Enquiries received:',
        response
      );

      this.enquiries = response ?? [];

    } catch (error) {

      console.error(
        'Could not load enquiries:',
        error
      );

      this.enquiries = [];

      this.enquiryError =
        'Could not load customer enquiries.';

    } finally {

      this.loadingEnquiries = false;

      console.log(
        'Enquiry count:',
        this.enquiries.length
      );

      console.log(
        'Loading:',
        this.loadingEnquiries
      );

      this.cdr.detectChanges();
    }
  }

  async updateStatus(
    enquiry: Enquiry,
    status: string
  ): Promise<void> {

    if (!this.statuses.includes(status)) {
      return;
    }

    const previousStatus = enquiry.status;

    enquiry.status = status;

    try {

      const updated = await firstValueFrom(
        this.http.patch<Enquiry>(
          `${this.enquiriesUrl}/${enquiry.id}/status`,
          { status }
        )
      );

      enquiry.status = updated.status;

      this.enquiryError = '';

    } catch (error) {

      console.error(
        'Could not update enquiry status:',
        error
      );

      enquiry.status = previousStatus;

      this.enquiryError =
        'Could not update enquiry status.';

    } finally {

      this.cdr.detectChanges();
    }
  }

  logout(): void {

    this.auth.logout();

    void this.router.navigate(['/login']);
  }
}