import { useState } from "react";
import type { FormEvent } from "react";
import BackendTest from "./BackendTest";
//import CustomerList from "./components/CustomerList";
import CustomerPage from "./components/CustomerPage";

type User = {
  username: string;
};

type LoginPageProps = {
  onLogin: (username: string, password: string) => boolean;
};

type HomePageProps = {
  username: string;
  onLogout: () => void;
  onNavigateToCustomerPage: () => void;
};

const DEMO_USERNAME = "demo";
const DEMO_PASSWORD = "password123";

function App() {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("demo-user");

    if (!savedUser) {
      return null;
    }

    try {
      //return JSON.parse(savedUser) as User;
      const parsedUser = JSON.parse(savedUser);
      if (typeof parsedUser === "object" &&
          parsedUser !== null &&
          typeof parsedUser.username === "string"
      ) {
        return parsedUser as User;
      } else {
        console.warn("Invalid user data in localStorage:", parsedUser);
        localStorage.removeItem("demo-user");
        return null;
      }      
    } catch {
      localStorage.removeItem("demo-user");
      return null;
    }
  });

  const [currentPage, setCurrentPage] = useState<string | null>(null);

  function handleLogin(username: string, password: string): boolean {
    // Temporary mock login.
    // Later, replace this with a call to the C# backend.
    if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
      const loggedInUser: User = { username };

      localStorage.setItem("demo-user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);

      return true;
    }

    return false;
  }

  function handleLogout() {
    localStorage.removeItem("demo-user");
    setUser(null);
    setCurrentPage(null);
  }

  /*
  return user ? (
    <HomePage username={user.username} onLogout={handleLogout} />
  ) : (
    <LoginPage onLogin={handleLogin} />
  );
  */

  if (user) {
    if (currentPage === "customers") {
      return <CustomerPage onBack={() => setCurrentPage(null)} onLogout={handleLogout} />;
    } else {
      return <HomePage username={user.username} onLogout={handleLogout} onNavigateToCustomerPage={() => setCurrentPage("customers")} />;
    }
  } else {
    return <LoginPage onLogin={handleLogin} />;
  }
}

function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("demo");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const success = onLogin(username.trim(), password);

    if (!success) {
      setError("Invalid username or password. Try demo / password123.");
    }
  }

  return (
    <main className="page">
      <section className="card login-card">
        <p className="eyebrow">Portfolio Project</p>

        <h1>SGS Examinations</h1>

        <p className="muted">
          Sign in to continue to the protected home page.
        </p>

        <form onSubmit={submitForm} className="form">
          <label>
            Username
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </label>

          {error && <div className="error">{error}</div>}

          <label className="checkbox-label">
            <input type="checkbox" />
            Remember me
          </label>

          <button type="submit">Login</button>
        </form>

        <p className="hint">
          Demo login: <strong>demo</strong> /{" "}
          <strong>password123</strong>
        </p>
      </section>
    </main>
  );
}

function HomePage({ username, onLogout, onNavigateToCustomerPage }: HomePageProps) {
  const [databaseMessage, setDatabaseMessage] = useState("");

  async function testDatabase() {
    try {
      setDatabaseMessage("Testing database connection...");

      if (!import.meta.env.VITE_API_BASE_URL) {
        throw new Error("API base URL is not defined.");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/test-database`
      );

      if (!response.ok) {
        throw new Error(
          `Database request failed with status ${response.status}.`
        );
      }

      const data: { message: string } = await response.json();

      setDatabaseMessage(data.message);
    } catch (error) {
      console.error("Database test failed:", error);
      setDatabaseMessage("Could not connect to MySQL.");
    }
  }

  return (
    <main className="page">
      <section className="card home-card">
        <p className="eyebrow">Protected Page</p>

        <h1>Hello, {username}!</h1>

        <p className="success">
          You have successfully logged in.
        </p>

        <div className="status-grid">
          <div>✓ React app loaded</div>
          <div>✓ Login flow working</div>
          <div>✓ Protected page displayed</div>
          <div>✓ Ready for real API integration</div>

          <BackendTest />

          <button type="button" onClick={testDatabase}>
            Test MySQL Database
          </button>

          <h1>Customer Management</h1>

          {/*<CustomerList />*/}

          {/*<CustomerPage />*/}

          {databaseMessage && <p>{databaseMessage}</p>}
        </div>
        <div className="button-group">
          <button
            type="button"
            onClick={onLogout}
            className="secondary-button"
          >
            Logout
          </button>

          <button
            type="button"
            onClick={onNavigateToCustomerPage}
            className="secondary-button"
          >
            Customers
          </button>
      </div>
      </section>
    </main>
  );
}

export default App;