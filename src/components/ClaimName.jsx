import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, runTransaction } from 'firebase/firestore';
import { db } from '../firebase';

export default function ClaimName({ user, onClaimed }) {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'students'), orderBy('order', 'asc'));
    return onSnapshot(q, snap =>
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, []);

  async function claim(s) {
    if (s.claimedBy && s.claimedBy !== user.uid) return;
    if (s.claimedBy === user.uid) return;
    setBusyId(s.id); setErr(null);
    try {
      await runTransaction(db, async (tx) => {
        const ref = doc(db, 'students', s.id);
        const snap = await tx.get(ref);
        if (!snap.exists()) throw new Error('Студент не найден');
        const data = snap.data();
        if (data.claimedBy && data.claimedBy !== user.uid) {
          throw new Error('Это имя только что заняли. Выбери другое.');
        }
        tx.update(ref, { claimedBy: user.uid });
      });
      onClaimed({ id: s.id, ...s, claimedBy: user.uid });
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusyId(null);
    }
  }

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div className="claim-screen">
      <div className="claim-container">
        <header className="claim-header">
          <div className="claim-badge">Шаг 1 из 2</div>
          <h1 className="claim-title">Выбери своё имя</h1>
          <p className="claim-sub">
            Один раз и навсегда. После этого выйти под этим именем сможешь только ты
            со своего Google-аккаунта <strong>{user.email}</strong>
          </p>
        </header>

        <div className="claim-search-wrap">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            className="claim-search"
            placeholder="Поиск по имени..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        {err && <div className="error-banner">{err}</div>}

        <div className="claim-grid">
          {filtered.map(s => {
            const takenByOther = s.claimedBy && s.claimedBy !== user.uid;
            const mine = s.claimedBy === user.uid;
            const busy = busyId === s.id;
            return (
              <button
                key={s.id}
                className={`claim-card ${takenByOther ? 'locked' : ''} ${mine ? 'mine' : ''}`}
                onClick={() => claim(s)}
                disabled={takenByOther || mine || busy}
              >
                <span className="claim-order">{s.order}</span>
                <span className="claim-name">{s.name}</span>
                <span className="claim-status">
                  {busy ? <span className="btn-spinner small" /> :
                   mine ? '✓ Ты' :
                   takenByOther ? '🔒 Занято' : ''}
                </span>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="claim-noresult">Ничего не найдено</p>
          )}
        </div>
      </div>
    </div>
  );
}