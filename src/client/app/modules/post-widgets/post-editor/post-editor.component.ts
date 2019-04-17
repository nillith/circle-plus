import {Component, Input, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {PostData} from "../../../../../shared/interf";
import {MarkdownEditorComponent} from "../../markdown/markdown-editor/markdown-editor.component";
import {StringIds} from '../../i18n/translations/string-ids';

const enum PostActions {
  Edit,
  Delete,
  Mute,
  UnMute,
}

const ActionOption = {
  [PostActions.Edit]: {
    action: PostActions.Edit,
    icon: 'edit',
    name: 'Edit'
  },
  [PostActions.Delete]: {
    action: PostActions.Delete,
    icon: 'delete',
    name: 'Delete'
  },
  [PostActions.UnMute]: {
    action: PostActions.UnMute,
    icon: 'notifications_off',
    name: 'Muted'
  },
  [PostActions.Mute]: {
    action: PostActions.Mute,
    icon: 'notifications_on',
    name: 'Mute'
  }
};

const noop = () => {
};

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

  notifyParent = noop;

  @ViewChild('markdownEditor')
  private editor: MarkdownEditorComponent;

  enabledActions = [PostActions.Edit, PostActions.Mute, PostActions.UnMute, PostActions.Delete].map(action => ActionOption[action]);

  constructor(private viewContainerRef: ViewContainerRef) {
    const hostComponent = this.viewContainerRef["_view"].component;
    if (hostComponent.onChildSizeChange) {
      this.notifyParent = () => {
        hostComponent.onChildSizeChange();
      };
    }
  }

  ngOnInit() {
    console.log(this.post);
  }

  toggleEditMode() {
    const self = this;
    self.editMode = !self.editMode;
    self.notifyParent();
  }

  onMenu(action: PostActions) {
    const self = this;
    switch (action) {
      case PostActions.Edit:
        self.toggleEditMode();
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
}
