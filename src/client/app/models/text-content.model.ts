import {ModelBase} from "./model-base";
import {MinimumUser} from "../../../shared/contracts";

export abstract class TextContentModel extends ModelBase {
  authorId?: string;
  author?: MinimumUser;
  content?: string;
  createdAt?: number;
  updatedAt?: number;
  plusCount?: number;
  mentionIds?: string[];
}
