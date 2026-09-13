import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ManageDesignsComponent } from './manage-designs.component';
import { BusinessAuthService } from './business-auth.service';
@Component({selector:'app-business-dashboard',standalone:true,imports:[CommonModule, ManageDesignsComponent],templateUrl:'./business-dashboard.component.html',styleUrl:'./business-dashboard.component.scss'})
export class BusinessDashboardComponent {
  readonly stats=[{label:'New Enquiries',value:8,tone:'pink'},{label:'Active Orders',value:14,tone:'gold'},{label:'In Production',value:6,tone:'violet'},{label:'Ready for Delivery',value:4,tone:'green'}];
  readonly enquiries=[{name:'Sri Lakshmi Boutique',product:'Bridal blouses',quantity:12,status:'New'},{name:'Anantapur Public School',product:'Uniform logos',quantity:180,status:'Contacted'},{name:'Meena Reddy',product:'Saree border',quantity:1,status:'Reviewing'}];
  constructor(private readonly auth:BusinessAuthService,private readonly router:Router){}
  logout():void{this.auth.logout();void this.router.navigate(['/login']);}
}

