import { useEffect, useState } from 'react';
import {
  collection, query, where, orderBy, onSnapshot,
  doc, deleteDoc, getDoc, setDoc, Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

const QUEUE_DURATION_MS = 90 * 60 * 1000;

export default function Queue({ subject, student }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setLoading(true);
    const q = query(
  collection(db, 'queueEntries'),
  where('subjectId', '==', subject.id)
  // orderBy убран, сортировка будет ниже
);
const unsub = onSnapshot(q,
  snap => {
    const sorted = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => a.joinedAt.toMillis() - b.joinedAt.toMillis()); // Сортировка на клиенте
    setEntries(sorted);
    setLoading(false);
  },
  err => { /* ... */ }
);
    return () => unsub();
  }, [subject.id]);

  const now = Date.now();
  const active = entries.filter(e => e.expiresAt.toMillis() > now);
  const mine = active.find(e => e.studentId === student.id);
  const myIndex = mine ? active.indexOf(mine) : -1;
  const before = myIndex > 0 ? active[myIndex - 1] : null;

  async function handleJoin() {
    setJoining(true);
    try {
      const entryRef = doc(db, 'queueEntries', student.id); // ID = studentId
      const snap = await getDoc(entryRef);
      
      if (snap.exists() && snap.data().expiresAt.toMillis() > Date.now()) {
        throw new Error('Ты уже в очереди. Сначала выйди из текущей.');
      }

      const joinedAt = Timestamp.now();
      const expiresAt = Timestamp.fromMillis(Date.now() + QUEUE_DURATION_MS);
      await setDoc(entryRef, {
        subjectId: subject.id,
        studentId: student.id,
        name: student.name,
        joinedAt,
        expiresAt,
      });
    } catch (e) {
      alert(e.message);
    } finally {
      setJoining(false);
    }
  }

  async function handleLeave() {
    if (!mine) return;
    if (!confirm('Выйти из очереди?')) return;
    try {
      await deleteDoc(doc(db, 'queueEntries', student.id));
    } catch (e) {
      alert('Ошибка: ' + e.message);
    }
  }

  if (loading) {
    return <div className="queue-empty"><div className="spinner" /></div>;
  }

  return (
    <div className="queue-panel">
      <header className="queue-header">
        <div>
          <h1 className="queue-title">{subject.name}</h1>
          <p className="queue-meta">
            {active.length === 0 ? 'Пока никого' : `${active.length} ${plural(active.length, 'человек', 'человека', 'человек')} в очереди`}
          </p>
        </div>
      </header>

      {mine ? (
        <div className="my-status">
          <div className="my-pos">
            <span className="my-pos-label">Твоё место</span>
            <span className="my-pos-num">{myIndex + 1}</span>
          </div>
          <div className="my-info">
            {myIndex === 0 ? (
              <p className="my-headline">Твоя очередь — проходи 🎯</p>
            ) : (
              <>
                <p className="my-headline">
                  Перед тобой {myIndex} {plural(myIndex, 'человек', 'человека', 'человек')}
                </p>
                <p className="my-sub">Ближайший: {before?.name}</p>
              </>
            )}
            <p className="my-timer">Осталось: {formatTime(mine.expiresAt.toMillis() - now)}</p>
          </div>
        </div>
      ) : null}

      <div className="queue-actions">
        {mine ? (
          <button className="btn-danger" onClick={handleLeave}>
            Выйти из очереди
          </button>
        ) : (
          <button className="btn-primary" onClick={handleJoin} disabled={joining}>
            {joining ? <span className="btn-spinner" /> : 'Занять очередь'}
          </button>
        )}
      </div>

      <ol className="queue-list">
        {active.map((entry, i) => {
          const isMine = entry.studentId === student.id;
          const remaining = entry.expiresAt.toMillis() - now;
          return (
            <li key={entry.id} className={`queue-item ${isMine ? 'mine' : ''}`}>
              <span className="queue-pos">{i + 1}</span>
              <span className="queue-name">
                {entry.name}
                {isMine && <span className="you-badge">ты</span>}
              </span>
              <span className={`queue-time ${remaining < 5 * 60 * 1000 ? 'urgent' : ''}`}>
                {formatTime(remaining)}
              </span>
            </li>
          );
        })}
        {active.length === 0 && (
          <li className="queue-empty-row">Очередь пуста — займи первое место</li>
        )}
      </ol>
    </div>
  );
}

function formatTime(ms) {
  if (ms <= 0) return 'истекло';
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function plural(n, one, few, many) {
  const a = n % 10, b = n % 100;
  if (a === 1 && b !== 11) return one;
  if (a >= 2 && a <= 4 && (b < 10 || b >= 20)) return few;
  return many;
}