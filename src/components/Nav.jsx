import { NavLink } from 'react-router-dom';

export default function Nav() {
  return (
    <header className="app-header">
      <div className="brand">
        <span>SECCEWLMMS</span>
        <small>daily scores</small>
      </div>
      <nav className="nav">
        <NavLink to="/rawdata">rawdata</NavLink>
        <NavLink to="/analytics">analytics</NavLink>
        <NavLink to="/definitions">definitions</NavLink>
      </nav>
    </header>
  );
}
