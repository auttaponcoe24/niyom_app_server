export type TUser = {
  id: number;
  image_profile: string;
  firstname: string;
  lastname: string;
  card_id: string;
  email: string;
  password: string;
  confirm_password: string;
  role: 'OWNER' | 'CUSTOMER';
  status: 'PENDING' | 'REJECT' | 'SUCCESS';
  phone_number: string;
  house_number: string;
  address: string;
  prefixId: number;
  zoneId: number;
};
