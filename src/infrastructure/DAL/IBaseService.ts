export interface IBaseService {
  exists(id: string): Promise<boolean>;
}
