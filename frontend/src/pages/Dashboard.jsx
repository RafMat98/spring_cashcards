import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

export default function Dashboard() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [creating, setCreating] = useState(false);
  // Transfer form
  const [fromCardId, setFromCardId] = useState("");
  const [toCardId, setToCardId] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferMsg, setTransferMsg] = useState("");
  const [transferring, setTransferring] = useState(false);
  // Fetch cards on mount
  useEffect(() => {
    if (!auth) {
      navigate("/login");
      return;
    }
    fetchCards();
  }, [auth]);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const res = await auth.api.get("/cashcards?sortBy=amount&direction=desc");
      setCards(res.data);
    } catch {
      setError("Αδυναμία φόρτωσης cards.");
    } finally {
      setLoading(false);
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
      const res = await auth.api.post("/cashcards/transfer", {
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
      await fetchCards();
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

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Τα Cash Cards μου</h1>
        <div className="header-right">
          <span className="welcome">
            Γεια, <strong>{auth?.username}</strong>
          </span>
          <button onClick={handleLogout} className="logout-btn">
            Αποσύνδεση
          </button>
        </div>
      </header>

      <main className="dashboard-main">
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
                transferMsg.startsWith("success") ? "success-msg" : "error-msg"
              }
            >
              {transferMsg.split(":")[1]}
            </p>
          )}
        </section>

        {/* Cards List */}
        <section className="cards-section">
          <h2>Τα Cards σου ({cards.length})</h2>

          {loading ? (
            <p className="loading">Φόρτωση...</p>
          ) : cards.length === 0 ? (
            <p className="empty">Δεν έχεις cards ακόμα. Δημιούργησε ένα!</p>
          ) : (
            <div className="cards-grid">
              {cards.map((card) => (
                <div key={card.id} className="card">
                  <div className="card-id">#{card.id}</div>
                  <div className="card-amount">€{card.amount.toFixed(2)}</div>
                  <div className="card-owner">{card.owner}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
