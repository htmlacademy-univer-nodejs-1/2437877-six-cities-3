import {UserType} from './UserType.js';

export class User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  userType: UserType;

  constructor(id: string, name: string, email: string, userType: UserType, avatar?: string) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.userType = userType;
    this.avatar = avatar;
  }
}

export class UserWithPassword extends User {
  password: string;

  constructor(id: string, name: string, email: string, password: string, userType: UserType, avatar?: string) {
    super(id, name, email, userType, avatar);
    this.password = password;
  }
}
