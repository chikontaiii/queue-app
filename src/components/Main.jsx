import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import Subjects from './Subjects';
import Queue from './Queue';

export default function Main({ user, student, theme, toggleTheme }) {
  const [subjects, setSubjects] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    (async () => {
      const snap = await getDocs(query(collection(db, 'subjects'), orderBy('order', 'asc')));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setSubjects(list);
      if (list.length && !active) setActive(list[0]);
    })();
  }, []);

  return (
    <div className="main">
      <header className="topbar">
        <div className="topbar-left">
          <div className="topbar-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
              <path d="M4 6h16M4 12h10M4 18h6" strokeLinecap="round" />
            </svg>
          </div>
          <span className="topbar-brand">Очередь</span>
        </div>
        
        <div className="topbar-right">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          
          <div className="topbar-user">
            {user.photoURL && <img src={user.photoURL} alt="" className="topbar-avatar" referrerPolicy="no-referrer" />}
            <div className="topbar-info">
              <span className="topbar-name">{student.name}</span>
              <span className="topbar-email">{user.email}</span>
            </div>
          </div>
          
          <button className="logout-btn" onClick={() => signOut(auth)} title="Выйти">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </header>

      <div className="main-body">
        <Subjects subjects={subjects} active={active} onSelect={setActive} />
        <div className="queue-area">
          {active ? (
            <Queue key={active.id} subject={active} student={student} />
          ) : (
            <div className="queue-empty">
              <p>Выбери предмет слева</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}