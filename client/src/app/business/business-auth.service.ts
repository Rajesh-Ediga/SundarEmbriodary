import { Injectable } from '@angular/core';
@Injectable({providedIn:'root'})
export class BusinessAuthService {
  private readonly sessionKey='sundar-business-demo-session';
  login(identifier:string,password:string):boolean { const valid=identifier.trim().toLowerCase()==='admin@sundarembroidery.com'&&password==='admin123'; if(valid)sessionStorage.setItem(this.sessionKey,'authenticated'); return valid; }
  logout():void { sessionStorage.removeItem(this.sessionKey); }
  isAuthenticated():boolean { return sessionStorage.getItem(this.sessionKey)==='authenticated'; }
}
