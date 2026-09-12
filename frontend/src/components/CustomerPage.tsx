import { useEffect, useState } from "react";
import CustomerForm from "./CustomerForm";
import { getCustomers, deleteCustomer, HttpError } from "../services/customerService";
import type { Customer } from "../types/Customer";

interface CustomerPageProps {
  onBack: () => void;
  onLogout: () => void;
}

export type Operation =
  | { type: "none" }
  | { type: "saving" }
  | { type: "deleting"; customerId: number };

function CustomerPage({ onBack, onLogout }: CustomerPageProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [operation, setOperation] = useState<Operation>({ type: "none" });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [customerBeingEdited, setCustomerBeingEdited] = useState<Customer | null>(null);
  //const [isSaving, setIsSaving] = useState(false);
  const isSaving = operation.type === "saving";
  const isDeleting = (customerId: number) => operation.type === "deleting" && operation.customerId === customerId;

  async function loadCustomers() {
    try {
      setIsLoading(true);
      const data = await getCustomers();
      setCustomers(data);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not load customers."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  function handleCustomerCreated(customer: Customer) {
    setCustomers((currentCustomers) => [
      ...currentCustomers,
      customer,
    ]);
  }

  function handleCustomerUpdated(updatedCustomer: Customer) {
    setCustomers((currentCustomers) =>
      currentCustomers.map((customer) =>
        customer.id === updatedCustomer.id
          ? updatedCustomer
          : customer
      )
    );

    setCustomerBeingEdited(null);
  }

  async function handleNotFoundError(error: Error): Promise<boolean> {
     if (!(error instanceof HttpError) || error.status !== 404) {
      return false;
    }

    setCustomerBeingEdited(null);
    setErrorMessage("The customer no longer exists.");

    const confirmed = window.confirm( "The customer no longer exists. Refresh the customer list?");
    if (confirmed) {
      try {
        await loadCustomers();
      } catch (loadError) {
        console.error(loadError);
        setErrorMessage("The customer no longer exists, and the customer list could not be refreshed.");
      }
    }
    
    return true;
  }

  async function handleDeleteCustomer(customer: Customer) {
    const confirmed = window.confirm("Are you sure you want to delete this customer?");

    if (confirmed) {      
      setOperation({ type: "deleting", customerId: customer.id });
      setCustomerBeingEdited(null);

      try {
        await deleteCustomer(customer.id);
        setCustomers((currentCustomers) =>
          currentCustomers.filter((c) => c.id !== customer.id)
        );
        setErrorMessage("");
      } catch (error) {
        console.error(error);

        if (!await handleNotFoundError(error as Error)) {          
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Could not delete customer."
          );
        }
      } finally {        
        setOperation({ type: "none" });
      } 
    }
  }

  return (
    <main className="page">
      <div className="customer-card">
        <section>
          <fieldset disabled={isSaving}>
            <CustomerForm
              customerBeingEdited={customerBeingEdited}
              onCustomerCreated={handleCustomerCreated}
              onCustomerUpdated={handleCustomerUpdated}
              onCancelEdit={() => setCustomerBeingEdited(null)}
              operation={operation}
              onSetOperation={setOperation}
              //isSaving={isSaving}
              //onSetIsSaving={setIsSaving}
              onHandleNotFoundError={handleNotFoundError}
            />

            <h2>Customers</h2>

            {isLoading && <p>Loading customers...</p>}

            {errorMessage && (
              <p className="error-message">{errorMessage}</p>
            )}

            {!isLoading && !errorMessage && customers.length === 0 && (
              <p>No customers found.</p>
            )}

            {customers.length > 0 && (
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
                      <td>
                        <button
                          type="button"
                          onClick={() => setCustomerBeingEdited(customer)}
                        >
                          Edit
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          //disabled={isDeleting(customer.id)}
                          onClick={async () => {
                            await handleDeleteCustomer(customer);
                          }}
                        >
                          {isDeleting(customer.id) ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </fieldset>
          
          <div className="button-group">
            <button
              type="button"
              onClick={onBack}
              className="secondary-button"
            >
              Back
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="secondary-button"  
            >
              Logout
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default CustomerPage;