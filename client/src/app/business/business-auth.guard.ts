import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { BusinessAuthService } from './business-auth.service';
export const businessAuthGuard:CanActivateFn=()=>{const auth=inject(BusinessAuthService),router=inject(Router);return auth.isAuthenticated()||router.createUrlTree(['/business/login']);};
