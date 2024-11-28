import {UserType} from './UserType.js';

export class User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  password: string;
  userType: UserType;

  constructor(id: number, name: string, email: string, password: string, userType: UserType, avatar?: string) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.userType = userType;
    this.avatar = avatar;
  }
}
