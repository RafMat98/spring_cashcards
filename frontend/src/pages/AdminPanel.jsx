import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AdminPanel.css";

export default function AdminPanel() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [cards, setCards] = useState([]);
  const [tab, setTab] = useState("users");
  const [error, setError] = useState("");

  // New user form
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("USER");
  const [creating, setCreating] = useState(false);

  // Transfer form
  const [fromCardId, setFromCardId] = useState("");
  const [toCardId, setToCardId] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferMsg, setTransferMsg] = useState("");
  const [transferring, setTransferring] = useState(false);

  const [newCardOwner, setNewCardOwner] = useState("");
  const [newAmount, setNewAmount] = useState("");

  useEffect(() => {
    if (!auth || auth.role !== "ADMIN") {
      navigate("/login");
      return;
    }
    fetchAll();
  }, [auth]);

  const fetchAll = async () => {
    try {
      const [uRes, cRes] = await Promise.all([
        auth.api.get("/admin/users"),
        auth.api.get("/admin/cards"),
      ]);
      setUsers(uRes.data);
      setCards(cRes.data);
    } catch {
      setError("Αδυναμία φόρτωσης δεδομένων.");
    }
  };

  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (!newAmount || isNaN(newAmount) || Number(newAmount) <= 0) {
      setError("Βάλε έγκυρο ποσό.");
      return;
    }
    if (!newCardOwner) {
      setError("Επίλεξε χρήστη.");
      return;
    }
    setCreating(true);
    setError("");
    try {
      await auth.api.post("/admin/cards", {
        amount: Number(newAmount),
        owner: newCardOwner,
      });
      setNewAmount("");
      setNewCardOwner("");
      await fetchAll(); // ← fetchAll
    } catch {
      setError("Αποτυχία δημιουργίας card.");
    } finally {
      setCreating(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      await auth.api.post("/admin/users", {
        username: newUsername,
        password: newPassword,
        role: newRole,
      });
      setNewUsername("");
      setNewPassword("");
      setNewRole("USER");
      await fetchAll();
    } catch (err) {
      if (err.response?.status === 409) setError("Ο χρήστης υπάρχει ήδη.");
      else setError("Αποτυχία δημιουργίας χρήστη.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (username) => {
    if (username === auth.username) {
      setError("Δεν μπορείς να διαγράψεις τον εαυτό σου!");
      return;
    }
    if (!confirm(`Διαγραφή χρήστη "${username}" και ΟΛΩΝ των cards του;`))
      return;
    try {
      await auth.api.delete(`/admin/users/${username}`);
      await fetchAll();
    } catch {
      setError("Αποτυχία διαγραφής.");
    }
  };

  const handleDeleteCard = async (id) => {
    if (!confirm("Διαγραφή αυτού του card;")) return;
    try {
      await auth.api.delete(`/admin/cards/${id}`);
      await fetchAll();
    } catch {
      setError("Αποτυχία διαγραφής.");
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setTransferMsg("");
    setError("");

    if (fromCardId === toCardId) {
      setTransferMsg("error:Δεν μπορείς να μεταφέρεις στο ίδιο card.");
      return;
    }
    if (Number(transferAmount) <= 0) {
      setTransferMsg("error:Το ποσό πρέπει να είναι θετικό.");
      return;
    }

    setTransferring(true);
    try {
      const res = await auth.api.post("/admin/transfer", {
        fromCardId: Number(fromCardId),
        toCardId: Number(toCardId),
        amount: Number(transferAmount),
      });
      setTransferMsg(
        `success:${res.data.message} — Card #${fromCardId}: €${res.data.from.newAmount.toFixed(2)} | Card #${toCardId}: €${res.data.to.newAmount.toFixed(2)}`,
      );
      setFromCardId("");
      setToCardId("");
      setTransferAmount("");
      await fetchAll();
    } catch (err) {
      const msg = err.response?.data?.error || "Αποτυχία μεταφοράς.";
      setTransferMsg(`error:${msg}`);
    } finally {
      setTransferring(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const totalAmount = cards.reduce((sum, c) => sum + c.amount, 0);

  // helper for transferMsg format "success:..." ή "error:..."
  const transferType = transferMsg.startsWith("success:") ? "success" : "error";
  const transferText = transferMsg.replace(/^(success|error):/, "");

  return (
    <div className="admin">
      <header className="admin-header">
        <div className="admin-header-left">
          <span className="admin-badge">ADMIN</span>
          <h1>Admin Panel</h1>
        </div>
        <div className="header-right">
          <span className="welcome">
            Γεια, <strong>{auth?.username}</strong>
          </span>
          <button onClick={handleLogout} className="logout-btn">
            Αποσύνδεση
          </button>
        </div>
      </header>

      <main className="admin-main">
        {/* Stats bar */}
        <div className="stats-bar">
          <div className="stat">
            <span className="stat-num">{users.length}</span>
            <span className="stat-label">Χρήστες</span>
          </div>
          <div className="stat">
            <span className="stat-num">{cards.length}</span>
            <span className="stat-label">Cash Cards</span>
          </div>
          <div className="stat">
            <span className="stat-num">€{totalAmount.toFixed(2)}</span>
            <span className="stat-label">Συνολικό ποσό</span>
          </div>
        </div>
        Πρόσθεσε το select για τον χρήστη μέσα στη φόρμα: jsx
        {/* New Card Form */}
        <section className="create-section">
          <h2>Νέο Card για Χρήστη</h2>
          <form onSubmit={handleCreateCard} className="create-form">
            <select
              value={newCardOwner}
              onChange={(e) => setNewCardOwner(e.target.value)}
              required
            >
              <option value="">Επίλεξε χρήστη...</option>
              {users
                .filter((u) => u.role === "USER")
                .map((u) => (
                  <option key={u.id} value={u.username}>
                    {u.username}
                  </option>
                ))}
            </select>

            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Ποσό (π.χ. 50.00)"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              required
            />

            <button type="submit" disabled={creating}>
              {creating ? "Δημιουργία..." : "+ Προσθήκη"}
            </button>
          </form>
        </section>
        {error && <p className="error-msg">{error}</p>}
        {/* New User Form */}
        <section className="create-section">
          <h2>Νέος Χρήστης</h2>
          <form onSubmit={handleCreateUser} className="create-form">
            <input
              type="text"
              placeholder="Username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <button type="submit" disabled={creating}>
              {creating ? "Δημιουργία..." : "+ Προσθήκη"}
            </button>
          </form>
        </section>
        {/* Transfer Funds */}
        <section className="create-section transfer-section">
          <h2>💸 Μεταφορά Χρημάτων</h2>
          <form onSubmit={handleTransfer} className="create-form">
            <select
              value={fromCardId}
              onChange={(e) => setFromCardId(e.target.value)}
              required
            >
              <option value="">Από card...</option>
              {cards.map((c) => (
                <option key={c.id} value={c.id}>
                  #{c.id} — {c.owner} — €{c.amount.toFixed(2)}
                </option>
              ))}
            </select>

            <select
              value={toCardId}
              onChange={(e) => setToCardId(e.target.value)}
              required
            >
              <option value="">Προς card...</option>
              {cards
                .filter((c) => String(c.id) !== String(fromCardId))
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    #{c.id} — {c.owner} — €{c.amount.toFixed(2)}
                  </option>
                ))}
            </select>

            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Ποσό (€)"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={transferring}
              className="transfer-btn"
            >
              {transferring ? "Μεταφορά..." : "→ Μεταφορά"}
            </button>
          </form>

          {transferMsg && (
            <p
              className={
                transferType === "success" ? "success-msg" : "error-msg"
              }
            >
              {transferText}
            </p>
          )}
        </section>
        {error && <p className="error-msg">{error}</p>}
        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${tab === "users" ? "active" : ""}`}
            onClick={() => setTab("users")}
          >
            Χρήστες ({users.length})
          </button>
          <button
            className={`tab ${tab === "cards" ? "active" : ""}`}
            onClick={() => setTab("cards")}
          >
            Όλα τα Cards ({cards.length})
          </button>
        </div>
        {/* Users tab */}
        {tab === "users" && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Role</th>
                <th>Cards</th>
                <th>Ενέργεια</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="muted">#{u.id}</td>
                  <td>
                    <strong>{u.username}</strong>
                  </td>
                  <td>
                    <span className={`role-badge ${u.role.toLowerCase()}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>{cards.filter((c) => c.owner === u.username).length}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteUser(u.username)}
                      className="delete-btn"
                      disabled={u.username === auth?.username}
                    >
                      Διαγραφή
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Cards tab */}
        {tab === "cards" && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Ποσό</th>
                <th>Ιδιοκτήτης</th>
                <th>Ενέργεια</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((c) => (
                <tr key={c.id}>
                  <td className="muted">#{c.id}</td>
                  <td>
                    <strong>€{c.amount.toFixed(2)}</strong>
                  </td>
                  <td>{c.owner}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteCard(c.id)}
                      className="delete-btn"
                    >
                      Διαγραφή
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
