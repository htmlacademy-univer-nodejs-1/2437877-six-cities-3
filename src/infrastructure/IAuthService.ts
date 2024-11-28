export interface IAuthService {
  login(usernameOrEmail: string, password: string): Promise<string>;
  logout(token: string): Promise<void>;
  validateToken(token: string): Promise<any>;
}
