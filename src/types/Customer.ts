export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
}

export type NewCustomer = Omit<Customer, "id">;