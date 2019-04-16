import {MarkdownModule} from "../markdown/markdown.module";
import {UserInfoModule} from "../user-info/user-info.module";
import {PostWidgetsModule} from "../post-widgets/post-widgets.module";
import {WidgetsModule} from "../widgets/widgets.module";
import {CommonPipesModule} from "../common-pipes/common-pipes.module";


export const projectModules = [
  MarkdownModule,
  UserInfoModule,
  PostWidgetsModule,
  WidgetsModule,
  CommonPipesModule
];
