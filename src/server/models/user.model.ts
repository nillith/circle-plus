import db from '../persistence';
import passwordService from '../service/password.service';
import {cloneByFieldMaps, DatabaseDriver, makeFieldMaps, ModelBase} from "./model-base";
import {
  $id,
  $obfuscator,
  $toJsonFields,
  obfuscatorFuns,
  USER_OBFUSCATE_MAPS,
  userObfuscator
} from "../service/obfuscator.service";
import {Roles, UserRanks} from "../../shared/constants";
import {authService, JwtSignable} from "../service/auth.service";
import {devOnly, isNumericId} from "../utils/index";
import isEmail from "validator/lib/isEmail";
import {map} from 'lodash';
import {isValidEmailAddress, isValidPassword, isValidUsername, makeInstance} from "../../shared/utils";
import {SettingsData} from "../../shared/interf";
import {CircleModel} from "./circle.model";


export interface UserCreateInfo {
  username?: string;
  nickname?: string;
  password?: string;
  email?: string;
  role?: number;
}


const JWT_PAYLOAD_FIELD_MAPS = makeFieldMaps([
  $id, 'username', 'role'
]);


const createSaveSettingsSql = (function() {
  const AllowedDbColumnMap = {
    username: 'username',
    nickname: 'nickname',
    avatarUrl: 'avatarUrl',
    email: 'email',
  };

  return function(data: SettingsData) {
    const updates = Object.keys(data).map((k) => {
      const col = AllowedDbColumnMap[k];
      if (col && data[k]) {
        return `\`${col}\` = :${k}`;
      }
    })
      .filter(Boolean)
      .join(', ');
    return `UPDATE Users SET ${updates} WHERE id = :id`;
  };
})();

const assertValidNewModel = devOnly(function(model: UserModel) {
  console.assert(model.isNew(), `is not new`);
  console.assert(isValidPassword(model.password), `invalid password ${model.password}`);
  console.assert(isValidUsername(model.username), `invalid username ${model.username}`);
  console.assert(!model.email || (isValidEmailAddress(model.email) && isEmail(model.email)), `invalid email ${model.email}`);
  console.assert(model.salt && model.salt.length === 32, `invalid salt`);
  console.assert(model.hash && model.hash.length === 64, `invalid hash`);
});
const INSERT_SQL = `INSERT INTO Users (username, nickname, email, role, salt, hash) VALUES(:username, :nickname, :email, :role, :salt, :hash)`;

export interface OtherUser {
  id: string | number;
  nickname: string;
  avatarUrl: string;
}

export class UserModel extends ModelBase implements JwtSignable {
  static readonly [$toJsonFields] = makeFieldMaps([
    $id,
    'username',
    'nickname',
    'email',
    'role',
    'avatarUrl'
  ]);

  static readonly [$obfuscator] = userObfuscator;

  role?: string;
  avatarUrl?: string;
  hash?: Buffer;
  salt?: Buffer;
  username?: string;
  password?: string;
  email?: string;

  static unObfuscateFrom(obj: any): UserModel | undefined {
    throw Error('Not implemented');
  }

  static async create(body: UserCreateInfo, driver: DatabaseDriver = db): Promise<UserModel | undefined> {
    const user = UserModel.unObfuscateFrom({
      email: body.email || undefined,
      username: body.username || undefined,
      nickname: body.nickname || undefined,
      password: body.password || undefined,
      role: body.role || UserRanks[Roles.User],
    }) as UserModel;

    await user.hashPassword();
    await user.insertIntoDatabase(driver);
    return user;
  }

  static async emailExistsInDatabase(email: string): Promise<boolean> {
    console.assert(isEmail(email));
    const [rows] = await db.query(`SELECT id FROM Users WHERE email = :email LIMIT 1`, {email});
    return !!rows && !!(rows as any).length;
  }

  static async usernameExistsInDatabase(username: string): Promise<boolean> {
    console.assert(isValidUsername(username));
    const [rows] = await db.query(`SELECT id FROM Users WHERE username = :username LIMIT 1`, {username});
    return !!rows && !!(rows as any).length;
  }

  static async findById(id: number | string): Promise<UserModel | undefined> {
    console.assert(isFinite(id as number));
    const [rows] = await db.query('SELECT * FROM Users WHERE id = :id LIMIT 1', {id});
    if (rows && (rows as any).length) {
      return makeInstance(rows[0], UserModel);
    }
  }

  static async authenticate(userName: string, password: string): Promise<UserModel | undefined> {
    if (!isValidUsername(userName) || !isValidPassword(password)) {
      return;
    }
    const [rows] = await db.query(`SELECT id, username, nickname, avatarUrl, role, salt, hash FROM Users WHERE userName = :userName LIMIT 1`, {userName});
    if (rows && (rows as any).length) {
      const user = makeInstance(rows[0], UserModel);
      if (await user!.verifyPassword(password)) {
        return user;
      }
    }
  }

  async insertIntoDatabase(driver: DatabaseDriver = db): Promise<void> {
    const self = this;
    assertValidNewModel(self);
    await self.insertIntoDatabaseAndRetrieveId(driver, INSERT_SQL, self);
  }

  async verifyPassword(password: string): Promise<boolean> {
    const self = this;
    return passwordService.verifyPassword(self.salt!, self.hash!, password);
  }

  async hashPassword() {
    const self = this;
    console.assert(isValidPassword(self.password));
    self.salt = await passwordService.generateSalt();
    self.hash = await passwordService.passwordHash(self.salt, self.password!);
  }

  async changePassword(password: string, driver: DatabaseDriver = db) {
    this.password = password;
    await this.hashPassword();
    await db.execute(`UPDATE Users SET salt = :salt, hash = :hash WHERE id = :id`, this);
  }

  getJwtPayload(): Object {
    const self = this;
    self.obfuscate();
    return cloneByFieldMaps(self, JWT_PAYLOAD_FIELD_MAPS);
  }

  async getSubscriberIds() {
    console.assert(isNumericId(this.id));
    const [rows] = await db.query(`SELECT subscriberId FROM Subscriptions WHERE subscribeeId = :id`, this);
    return map(rows as any[], e => e.subscriberId);
  }

  async getCirclerIds() {
    console.assert(isNumericId(this.id));
    const [rows] = await db.query(`SELECT DISTINCT(CircleUser.userId) FROM Circles LEFT JOIN CircleUser ON (Circles.id = CircleUser.circleId) WHERE Circles.ownerId = :id`, this);
    return map(rows as any[], e => e.userId);
  }

  async saveSettings(data: SettingsData, driver: DatabaseDriver = db) {
    const self = this;
    const sql = createSaveSettingsSql(data);
    (data as any).id = self.id;
    await driver.query(sql, data);
    if (data.password) {
      await self.changePassword(data.password, driver);
    }
  }

  async getLoginData(expire?: string | number) {
    const self = this;
    const token = await authService.sign(self, expire);
    const circles = await CircleModel.getAllCircleForUser(self.id as number);

    return {
      token,
      user: self,
      circles,
    };
  }
}

({
  unObfuscateFrom: UserModel.unObfuscateFrom,
  obfuscate: UserModel.prototype.obfuscate
} = obfuscatorFuns(USER_OBFUSCATE_MAPS, UserModel));


