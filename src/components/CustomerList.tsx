import { useEffect, useState } from "react";
import { getCustomers } from "../services/customerService";
import type { Customer } from "../types/Customer";

function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    async function loadCustomers() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const customerData = await getCustomers();

        setCustomers(customerData);
      } catch (error) {
        console.error("Error loading customers:", error);

        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("An unexpected error occurred.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadCustomers();
  }, []);

  if (isLoading) {
    return <p>Loading customers...</p>;
  }

  if (errorMessage) {
    return <p className="error-message">{errorMessage}</p>;
  }

  return (
    <section>
      <h2>Customers</h2>

      {customers.length === 0 ? (
        <p>No customers found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.id}</td>
                <td>{customer.name}</td>
                <td>{customer.email}</td>
                <td>{customer.phone ?? "Not provided"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default CustomerList;