import {NgModule} from '@angular/core';
import {UserLinkPipe} from './user-link.pipe';
import {AvatarUrlPipe} from './avatar-url.pipe';


export const exportedEntryComponents = [];
const exportedComponents = [
  ...exportedEntryComponents,
  UserLinkPipe, AvatarUrlPipe
];


@NgModule({
  declarations: [...exportedComponents],
  imports: [],
  exports: exportedComponents,
  entryComponents: exportedEntryComponents
})
export class CommonPipesModule {
}
