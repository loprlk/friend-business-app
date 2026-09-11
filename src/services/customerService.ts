import type { Customer, NewCustomer } from "../types/Customer";

//const API_URL = "http://localhost:5208/api/customers";
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/customers`;

if (!import.meta.env.VITE_API_BASE_URL) {
  throw new Error("API base URL is not defined.");
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "HttpError";
  }
}

export async function getCustomers(): Promise<Customer[]> {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new HttpError(response.status, "Unable to load customers.");
  }

  return response.json();
}

export async function createCustomer(
  customer: NewCustomer
): Promise<Customer> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(customer),
  });

  if (!response.ok) {
    throw new HttpError(response.status, "Unable to create the customer.");
  }

  return response.json();
}

export async function updateCustomer(
  customer: Customer
): Promise<Customer> {
  const response = await fetch(`${API_URL}/${customer.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(customer),
  });

  if (response.status === 404) {
    throw new HttpError(response.status, "Customer not found.");
  } 

  if (!response.ok) {
    throw new HttpError(response.status, "Failed to update customer.");
  }

  // Some PUT endpoints return 204 No Content.
  if (response.status === 204) {
    return customer;
  }

  return await response.json();
}

export async function deleteCustomer(customerId: number): Promise<void> {
  const response = await fetch(`${API_URL}/${customerId}`, {
    method: "DELETE",
  });

  if (response.status === 404) {
    throw new HttpError(response.status, "Customer not found.");
  }
  
  if (!response.ok) {
    throw new HttpError(response.status, "Failed to delete customer.");
  }
}