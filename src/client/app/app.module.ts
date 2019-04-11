import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {JwtModule} from '@auth0/angular-jwt';
import {environment} from "../environments/environment";
import {getAccessToken} from "../utils/auth";
import {PagesModule} from "./pages/pages.module";
import {SharedModule} from "./shared/shared.module";
import {RouterModule, Routes} from "@angular/router";
import {HomeComponent} from "./pages/home/home.component";

const appRoutes: Routes = [
  {path: '', component: HomeComponent},
];

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    SharedModule,
    PagesModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: getAccessToken,
        whitelistedDomains: environment.jwtModule.whitelistedDomains,
        blacklistedRoutes: environment.jwtModule.blacklistedRoutes
      }
    }),
    RouterModule.forRoot(
      appRoutes,
      {enableTracing: environment.production} // <-- debugging purposes only
    )
  ],
  providers: [
    // uncomment this for "hash-bang" routing
    // { provide: LocationStrategy, useClass: HashLocationStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {

  }
}
