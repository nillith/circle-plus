import {Component, Input, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {PostData} from "../../../../../shared/interf";
import {MarkdownEditorComponent} from "../../markdown/markdown-editor/markdown-editor.component";
import {StringIds} from '../../i18n/translations/string-ids';
import {PostApiService} from "../../../api/post-api.service";
import {noop} from "../../../../../shared/utils";
import {getIconMenuOption, MenuActions} from "../../../../constants";
import {NullaryAsyncAction} from "../../../../utils/switch-debouncer";

@Component({
  selector: 'app-post-editor',
  templateUrl: './post-editor.component.html',
  styleUrls: ['./post-editor.component.scss']
})
export class PostEditorComponent implements OnInit {
  readonly StringIds = StringIds;
  @Input() content: string;

  @Input() editMode = false;

  @Input() post: PostData;
  @Input() limitCommentHeight = false;
  @Input() showComments = true;
  plusAction: NullaryAsyncAction;
  unPlusAction: NullaryAsyncAction;


  notifyParent = noop;

  @ViewChild('markdownEditor')
  private editor: MarkdownEditorComponent;

  enabledActions = getIconMenuOption([MenuActions.Link]);

  constructor(private viewContainerRef: ViewContainerRef, private postApi: PostApiService) {
    const self = this;
    const hostComponent = self.viewContainerRef["_view"].component;
    if (hostComponent.onChildSizeChange) {
      self.notifyParent = () => {
        hostComponent.onChildSizeChange();
      };
    }
    self.plusAction = async () => {
      await self.postApi.plusOne(self.post.id);
      self.post.plusedByMe = true;
    };

    self.unPlusAction = async () => {
      await self.postApi.unPlusOne(self.post.id);
      self.post.plusedByMe = false;
    };
  }

  ngOnInit() {
  }

  toggleEditMode() {
    const self = this;
    self.editMode = !self.editMode;
    self.notifyParent();
  }

  onMenu(action: MenuActions) {
    const self = this;
    switch (action) {
      case MenuActions.Edit:
        self.toggleEditMode();
        break;
      case MenuActions.Link:
        window.open(`p/${self.post.id}`);
        break;
    }
  }

  cancelEdit() {
    this.toggleEditMode();
  }

  saveEdit() {
    const self = this;
    self.post.content = self.editor.markdown;
    this.toggleEditMode();
  }

  onPlusClick() {
    this.plusOne.switch();
  }

  async onShareClick() {
    const self = this;
    await self.postApi.unPlusOne(self.post.id);
  }
}
