import { Routes } from '@angular/router';
import { businessAuthGuard } from './business/business-auth.guard';
import { BusinessDashboardComponent } from './business/business-dashboard.component';
import { BusinessLoginComponent } from './business/business-login.component';

export const routes: Routes = [
  { path: 'login', component: BusinessLoginComponent },
  { path: 'dashboard', component: BusinessDashboardComponent, canActivate: [businessAuthGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' }
];
