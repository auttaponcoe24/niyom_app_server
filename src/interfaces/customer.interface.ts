export interface ICustomer {
  id: number;
  id_passpost: string;
  firstname: string;
  lastname: string;
  phone_number: string;
  house_number: string;
  address?: string;
  createAt?: Date;
  updateAt?: Date;
  zoneId: number;
}
