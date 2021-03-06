export enum UserRoles {
  User = 1,
  Admin,
}

export enum PostVisibilities {
  Public = 1,
  Private,
  // Extended,
}

export namespace Activity {
  export enum ObjectTypes {
    User = 1,
    Post,
    Comment,
  }


  export enum ContentActions {
    PlusOne = 1,
    UnPlusOne,
    Edit,
    Create,
    Delete,
  }

  export enum UserActions {
    Circle = 1024,
    UnCircle,
    Block,
    UnBlock,
    Mention
  }

  export enum ContextTypes {
    Post = 1,
    Comment
  }

  export function isValidContextType(n?: any) {
    return n && n in ContextTypes;
  }

  export function isValidAction(objectType?: number, actionType?: number) {
    if (!objectType || !actionType) {
      return false;
    }
    switch (objectType) {
      case ObjectTypes.User:
        return actionType in UserActions;
      case ObjectTypes.Post: // fallthrough
      case ObjectTypes.Comment:
        return actionType in ContentActions;
      default:
        return false;
    }
  }

  export function isValidActivity(objectType?: number, actionType?: number, contextType?: number) {
    if (contextType) {
      if (contextType in ContextTypes) {
        switch (objectType) {
          case ObjectTypes.User:
            return actionType === UserActions.Mention;
          case ObjectTypes.Comment:
            return contextType === ContextTypes.Post && actionType! in ContentActions;
          default:
            return false;
        }
      } else {
        return false;
      }
    } else {
      switch (objectType) {
        case  ObjectTypes.User:
          return actionType !== UserActions.Mention;
        case ObjectTypes.Comment:
          return false;
      }

      return isValidAction(objectType, actionType);
    }
  }
}

export const isValidPostVisibility = function(p: any) {
  return !!p && p in PostVisibilities;
};


export enum PlusOneTypes {
  Post = 1,
  Comment,
}

export enum NotificationTypes {
  Mention = 1,
  Reply,
  PlusOneComment,
  PlusOnePost,
  ReSharePost,
}

export type IdType = string | number | undefined;

export interface AuthData {
  email?: string;
  username?: string;
  nickname?: string;
  password?: string;
  token?: string;
  type?: number;
  rememberMe?: boolean;
}

export interface AccessTokenData {
  id: string;
  username: string;
  role: UserRoles;
  iat?: number;
  exp?: number;
}

export interface UserNickname {
  id: string;
  nickname: string;
}

export interface UserData extends AccessTokenData, UserNickname {
}

export interface TextContentData {
  id?: string;
  authorId?: string;
  author?: UserData;
  content?: string;
  createdAt?: number;
  updatedAt?: number;
  plusCount?: number;
  mentionIds?: string[];
}

export interface CommentData extends TextContentData {
  postId?: string;
}

export interface Circle {
  id?: string;
  name: string;
}

export interface PostData extends TextContentData {
  comments?: CommentData[];
  reShareFromPostId?: string;
  reShareCount?: number;
  visibility?: number;
  visibleCircleIds?: string[];
  plusedByMe: boolean;
}

export interface CircleData {
  id?: string;
  name?: string;
  userIds?: string[];
  newUserIds: string[];
  deletedUserIds: string[];
}

export interface SyncCircleData {
  circles?: CircleData[];
  newCircles?: CircleData[];
}

