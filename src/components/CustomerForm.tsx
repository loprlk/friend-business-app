import { useState, useEffect } from "react";
//import { createCustomer, updateCustomer, HttpError } from "../services/customerService";
import { createCustomer, updateCustomer } from "../services/customerService";
import type { Customer } from "../types/Customer";
import type { Operation } from "./CustomerPage";

type CustomerFormProps = {
    customerBeingEdited: Customer | null;
    onCustomerCreated: (customer: Customer) => void;
    onCustomerUpdated: (customer: Customer) => void;
    onCancelEdit: () => void;
    operation: Operation;
    onSetOperation: React.Dispatch<React.SetStateAction<Operation>>;
    //isSaving: boolean;
    //onSetIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
    onHandleNotFoundError: (error: Error) => Promise<boolean>;
};

function CustomerForm({
  customerBeingEdited,
  onCustomerCreated,
  onCustomerUpdated,
  onCancelEdit,
  operation,
  onSetOperation,
  //isSaving,
  //onSetIsSaving,
  onHandleNotFoundError,
}: CustomerFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const isSaving = operation.type === "saving";
  
  function clearForm() {
  setName("");
  setEmail("");
  setPhone("");
  setErrorMessage("");
}

  useEffect(() => {
  if (customerBeingEdited) {
    setName(customerBeingEdited.name);
    setEmail(customerBeingEdited.email);
    setPhone(customerBeingEdited.phone ?? "");
  } else {
    clearForm();
  }
}, [customerBeingEdited]);

  async function handleSubmit(
    event: React.SubmitEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!name.trim() || !email.trim()) {
      setErrorMessage("Name and email are required.");
      return;
    }

    try {
      // setIsSaving(true);
      //onSetIsSaving(true);
      onSetOperation({ type: "saving" });
      setErrorMessage("");

      const normalizedPhone = phone.trim() === "" ? null : phone.trim();

      if (customerBeingEdited) {
        const customerToUpdate: Customer = {
          ...customerBeingEdited,
          name: name.trim(),
          email: email.trim(),
          phone: normalizedPhone,
        };

        const updatedCustomer = await updateCustomer(customerToUpdate);

        onCustomerUpdated(updatedCustomer);
      } else {
        const newCustomer = await createCustomer({
          name: name.trim(),
          email: email.trim(),
          phone: normalizedPhone,
        });

        onCustomerCreated(newCustomer);
      }
      clearForm();
    } catch (error) {
      console.error(error);

      if (await onHandleNotFoundError(error as Error) ) {
        return; // Exit early if the error was handled
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : (customerBeingEdited ? "Could not update the customer." : "Could not create the customer.")
      );      
    } finally {
      //setIsSaving(false);
      //onSetIsSaving(false);
      onSetOperation({ type: "none" });
    }
  }

  const isFormValid = name.trim().length >= 2 && email.trim() !== "";

  return (
    <section>
      <h2>
        {customerBeingEdited
          ? "Update Customer"
          : "Create Customer"}
      </h2>

      <form onSubmit={handleSubmit}>
        <label>
          Name
          <input
            value={name}
            minLength={2}
            maxLength={100}
            required
            onChange={(event) => setName(event.target.value)}
          />
          {name.trim() === "" && (<span className="error-message">Name is required.</span>)}
          {name.trim() !== "" && name.trim().length < 2 && (
            <span className="error-message">
              Name must be at least 2 characters.
              </span>
          )}
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            required
            maxLength={150}
            onChange={(event) => setEmail(event.target.value)}
          />
          {email.trim() === "" && (<span className="error-message">Email is required.</span>)}          
        </label>

        <label>
          Phone
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </label>

        {errorMessage && (
          <p className="error-message">{errorMessage}</p>
        )}

        <button type="submit" 
          disabled={isSaving || !isFormValid}>
          {isSaving ? "Saving..." : customerBeingEdited ? "Update Customer" : "Add Customer"}
        </button>

        {customerBeingEdited && (
          <button
            type="button"
            onClick={() => {
              clearForm();
              onCancelEdit();
            }}            
          >
            Cancel
          </button>
        )}
      </form>
    </section>
  );
}

export default CustomerForm;