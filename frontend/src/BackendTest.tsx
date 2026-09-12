import { useState } from "react";

function BackendTest() {
  const [message, setMessage] = useState("");

  async function testBackend() {
    try {
      if (!import.meta.env.VITE_API_BASE_URL) {
        throw new Error("API base URL is not defined.");
      }

      //const response = await fetch("http://localhost:5208/api/test");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/test`);

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data: { message: string } = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error(error);
      setMessage("Could not contact the C# backend.");
    }
  }

  return (
    <div>
      <button type="button" onClick={testBackend}>
        Test C# backend
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}

export default BackendTest;