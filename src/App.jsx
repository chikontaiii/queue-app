import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';
import Login from './components/Login';
import ClaimName from './components/ClaimName';
import Main from './components/Main';

export default function App() {
  const [state, setState] = useState('loading');
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  
  // Логика темы
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) { setState('login'); setStudent(null); return; }

      try {
        const snap = await getDocs(query(collection(db, 'students'), where('claimedBy', '==', u.uid)));
        if (snap.empty) {
          setState('claim');
        } else {
          const d = snap.docs[0];
          setStudent({ id: d.id, ...d.data() });
          setState('main');
        }
      } catch (e) {
        console.error(e);
        alert('Ошибка: ' + e.message);
        setState('login');
      }
    });
  }, []);

  if (state === 'loading') {
    return <div className="app-loading"><div className="spinner" /></div>;
  }

  if (state === 'login') return <Login theme={theme} toggleTheme={toggleTheme} />;
  if (state === 'claim') return <ClaimName user={user} onClaimed={(s) => { setStudent(s); setState('main'); }} theme={theme} toggleTheme={toggleTheme} />;
  return <Main user={user} student={student} theme={theme} toggleTheme={toggleTheme} />;
}