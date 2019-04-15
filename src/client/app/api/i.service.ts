import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {JwtHelperService} from "@auth0/angular-jwt";
import {getAccessToken, removeAccessToken, setAccessToken} from "../../utils/auth";
import {AccessTokenData, AuthData, LoginData, SettingsData, UserData} from "../../../shared/interf";
import {API_URLS} from "../../constants";
import {UserModel} from "../models/user.model";
import {CircleModel} from "../models/circle.model";
import {makeInstance} from "../../../shared/utils";


class DataStorage {
  constructor(private userId: string) {
  }

  private generateKey(key: string) {
    return `${this.userId}:${key}`;
  }

  saveString(key: string, data: string) {
    return localStorage.setItem(this.generateKey(key), data);
  }

  loadString(key: string): string {
    return localStorage.getItem(this.generateKey(key));
  }

  saveObject(key: string, obj: any) {
    if (!key || !obj) {
      return;
    }
    return this.saveString(key, JSON.stringify(obj));
  }

  loadObject(key: string): any {
    if (!key) {
      return;
    }
    const data = this.loadString(key);
    if (data) {
      return JSON.parse(data);
    }
  }

  clear() {
    localStorage.clear();
  }
}

const STORAGE_KEYS = {
  USER: 'user',
  CIRCLES: 'circles',
};

@Injectable({
  providedIn: 'root'
})
export class IService {
  private token: string;
  private tokenContent: AccessTokenData;
  public me;
  public circles: CircleModel[] = [];
  private storage?: DataStorage;
  public loading = false;


  constructor(private http: HttpClient, private jwtHelper: JwtHelperService) {
    const self = this;
    self.unpackToken(getAccessToken());
    if (self.isLoggedIn()) {
      self.loadUserFromStorage();
      self.loadCirclesFromStorage();
    }
    if (!self.me || self.me.isNew()) {
      self.logout();
    }
  }

  private unpackUserData(data: any) {
    if (!data) {
      return;
    }
    const self = this;
    self.me = new UserModel(self.http);
    self.me.assign(data);
  }

  private unpackCircleData(circleData: any) {
    if (!circleData) {
      return;
    }
    const self = this;
    self.circles = [];
    for (const c of circleData) {
      const circle = self.buildCircle();
      circle.assign(c);
      self.circles.push(circle);
      if (!c.users) {
        continue;
      }
      for (const u of c.users) {
        makeInstance(u, UserModel);
      }
    }
  }

  private unpackToken(token: string) {
    const self = this;
    self.token = token;
    self.tokenContent = undefined;
    if (!token) {
      return;
    }
    const {jwtHelper} = self;
    if (jwtHelper.isTokenExpired(token)) {
      removeAccessToken();
    } else {
      self.tokenContent = jwtHelper.decodeToken(token);
      self.storage = new DataStorage(self.tokenContent.id);
      setAccessToken(token);
    }
  }

  private loadUserFromStorage() {
    const self = this;
    self.unpackUserData(self.storage.loadObject(STORAGE_KEYS.USER));
  }

  private loadCirclesFromStorage() {
    const self = this;
    self.unpackCircleData(self.storage.loadObject(STORAGE_KEYS.CIRCLES));
  }

  onLogin(data: LoginData) {
    const self = this;
    self.unpackToken(data.token);
    self.unpackUserData(data.user);
    self.unpackCircleData(data.circles);
    self.storage.saveObject(STORAGE_KEYS.USER, data.user);
    self.storage.saveObject(STORAGE_KEYS.CIRCLES, data.circles);
  }

  updateUserData(data: UserData) {
    const self = this;
    self.me.assign(data);
    self.storage.saveObject(self.tokenContent.id, data);
  }

  onCircleCreated(circle: CircleModel) {
    if (!circle || !circle.id) {
      return;
    }
    const self = this;
    self.circles.push(circle);
    const circlesData = self.storage.loadObject(STORAGE_KEYS.CIRCLES);
    const c = circle.assignOut();
    if (c.users) {
      c.users = c.users.map((u) => {
        return u.cloneModelFields([
          'id', 'nickname', 'avatarUrl'
        ]);
      });
    }
    circlesData.push(c);
    self.storage.saveObject(STORAGE_KEYS.CIRCLES, circlesData);
  }

  logout() {
    const self = this;
    self.token = self.tokenContent = undefined;
    removeAccessToken();
    localStorage.clear();
  }


  async login(payload: AuthData) {
    const self = this;
    const {username, password, rememberMe} = payload;
    const loginResult = await self.http.post(API_URLS.LOGIN, {
      username,
      password,
      rememberMe
    }).toPromise() as any;
    self.onLogin(loginResult);
  }

  isLoggedIn() {
    const {token, jwtHelper} = this;
    return !!token && !jwtHelper.isTokenExpired(token);
  }

  buildCircle() {
    const self = this;
    return new CircleModel(self.http, self.me.id, self);
  }

  async saveSettings(data: SettingsData) {
    const self = this;
    await self.http.patch(API_URLS.SETTINGS, data, {
      responseType: 'text'
    }).toPromise();
    self.updateUserData(data as UserData);
  }
}
