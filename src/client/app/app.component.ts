import {Component} from '@angular/core';
import {appConstants} from "./app-constants";
import {NavEntry} from "./shared/views/main-nav-view/main-nav-view.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  navEntries: NavEntry[] = appConstants.sideNav;
}
