import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BusinessAuthService } from './business-auth.service';
@Component({selector:'app-business-login',standalone:true,imports:[FormsModule],templateUrl:'./business-login.component.html',styleUrl:'./business-login.component.scss'})
export class BusinessLoginComponent {
  identifier=''; password=''; error='';
  constructor(private readonly auth:BusinessAuthService,private readonly router:Router){if(auth.isAuthenticated())void router.navigate(['/business/dashboard']);}
  login():void { this.error=''; if(this.auth.login(this.identifier,this.password)){void this.router.navigate(['/business/dashboard']);return;} this.error='The email/mobile number or password is incorrect.'; }
}
