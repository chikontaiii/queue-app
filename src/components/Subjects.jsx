export default function Subjects({ subjects, active, onSelect }) {
  return (
    <aside className="subjects">
      <h2 className="subjects-title">Предметы</h2>
      <div className="subjects-list">
        {subjects.map(s => (
          <button
            key={s.id}
            className={`subject ${active?.id === s.id ? 'active' : ''}`}
            onClick={() => onSelect(s)}
          >
            <span className="subject-name">{s.name}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}