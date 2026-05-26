import { useMemo, useState } from 'react';
import { PATIENTS } from './data.js';

const Check = ({ active }) =>
  active ? <span className="icon active">✔</span> : <span className="icon">—</span>;

export default function App() {
  const [activeTab, setActiveTab] = useState('today');
  const [subTab, setSubTab] = useState('yet_to_be_seen');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let rows = PATIENTS.filter((p) => p.status === subTab);

    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((p) => p.name.toLowerCase().includes(q));
    }
    return rows;
  }, [subTab, search]);

  const yet = PATIENTS.filter((p) => p.status === 'yet_to_be_seen');

  const totalCopay = yet.reduce((sum, p) => sum + p.copay, 0);

  const pendingCopay = yet
    .filter((p) => p.payment === 'pending')
    .reduce((s, p) => s + p.copay, 0);
  const paidCopay = yet
    .filter((p) => p.payment === 'paid')
    .reduce((s, p) => s + p.copay, 0);
  const pendingPastDue = yet
    .filter((p) => p.payment === 'pending')
    .reduce((s, p) => s + p.due, 0);
  const paidPastDue = yet
    .filter((p) => p.payment === 'paid')
    .reduce((s, p) => s + p.due, 0);

  // BUG #3: registered count is hardcoded.
  const registered = 197;

  // BUG #5: hard-coded date string instead of today.
  const headerDate = 'Wed, 2 May 2026';

  return (
    <>
      <header className="top-bar">
        <div className="brand">
          <span className="logo">yosi</span>
          <span className="logo-health">health</span>
          <span className="brand-name">Yosi Health</span>
        </div>
        <nav className="top-nav">
          <span>iPad ID &amp; Key</span>
          <span>Support</span>
          <span className="office">🏠 Home Office</span>
          <span className="user">👤 Anbu</span>
        </nav>
      </header>

      <nav className="tabs">
        {[
          ['today', 'Today Patients'],
          ['payment', 'Payment'],
          ['referrals', 'Referrals'],
          ['surveys', 'Surveys'],
          ['users', 'Users'],
          ['reports', 'Reports'],
          ['ondemand', 'On Demand'],
          ['chat', 'YosiChat'],
        ].map(([key, label]) => (
          <button
            key={key}
            className={`tab ${activeTab === key ? 'active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
        <div className="tab-meta">
          <span id="current-date">{headerDate}</span>
          <input
            id="search"
            placeholder="Enter patient name or patient ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </nav>

      <main className="content">
        <section className="patient-panel">
          <div className="sub-tabs">
            {[
              ['yet_to_be_seen', 'YET TO BE SEEN'],
              ['checked_in', 'CHECKED-IN'],
              ['cancelled', 'CANCELLED'],
            ].map(([key, label]) => (
              <button
                key={key}
                className={`sub-tab ${subTab === key ? 'active' : ''}`}
                onClick={() => setSubTab(key)}
              >
                {label}
              </button>
            ))}
            <span className="last-updated">Last updated by 12:56:22 PM</span>
          </div>

          <div className="provider-group">Dr Adam Bricks</div>

          <table className="patients-table">
            <thead>
              <tr>
                <th></th>
                <th>Status</th>
                <th>Patient Name</th>
                <th>Appt Info</th>
                <th>Time</th>
                <th>Vaccine Question</th>
                <th>Co-Pay</th>
                <th>$ Due</th>
                <th>ADHOC</th>
                <th>Payment</th>
                <th>Refer</th>
                <th>Survey</th>
                <th>Product</th>
                <th>Scheduling Intake</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="14" className="empty">No patients found.</td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id}>
                    <td><input type="checkbox" /></td>
                    <td><span className="status-dot" /></td>
                    <td>{p.name}</td>
                    <td>{p.apptInfo}</td>
                    <td>{p.time}</td>
                    <td><Check active={p.vaccine} /></td>
                    <td>${p.copay.toFixed(2)}</td>
                    <td>${p.due.toFixed(2)}</td>
                    <td><Check active={p.adhoc} /></td>
                    <td>{p.payment}</td>
                    <td><Check active={p.refer} /></td>
                    <td><Check active={p.survey} /></td>
                    <td><Check active={p.product} /></td>
                    <td>{p.scheduling}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <aside className="stats-panel">
          <div className="stat-block green">
            <div className="stat-label">Patients</div>
            <div className="stat-sub">Registered</div>
            <div className="stat-value">{registered}</div>
          </div>

          <div className="stat-block">
            <div className="stat-label">Total Copay</div>
            <div className="stat-value blue">${totalCopay.toFixed(2)}</div>
          </div>

          <div className="stat-block">
            <div className="stat-label">Pending Copay</div>
            <div className="stat-value red">${pendingCopay.toFixed(2)}</div>
          </div>

          <div className="stat-block">
            <div className="stat-label">Paid Copay</div>
            <div className="stat-value blue">${paidCopay.toFixed(2)}</div>
          </div>

          <div className="stat-block">
            <div className="stat-label">Pending Past Due</div>
            <div className="stat-value red">${pendingPastDue.toFixed(2)}</div>
          </div>

          <div className="stat-block">
            <div className="stat-label">Paid Past Due</div>
            <div className="stat-value blue">${paidPastDue.toFixed(2)}</div>
          </div>
        </aside>
      </main>
    </>
  );
}
