import { Navigate, Route, Routes } from 'react-router-dom';
import Nav from './components/Nav.jsx';
import RawData from './pages/RawData.jsx';
import Analytics from './pages/Analytics.jsx';
import Definitions from './pages/Definitions.jsx';
import { useData } from './lib/useData.js';

export default function App() {
  const data = useData();

  return (
    <>
      <Nav />
      <main className="page">
        {data.error && (
          <div className="banner error">
            <strong>Couldn’t load sheet data:</strong> {data.error}
            <div style={{ marginTop: 8 }}>
              <button className="btn" onClick={data.refresh}>retry</button>
            </div>
          </div>
        )}
        {data.loading && <div className="banner">Loading data…</div>}

        <Routes>
          <Route path="/" element={<Navigate to="/rawdata" replace />} />
          <Route path="/rawdata" element={<RawData rows={data.rows} />} />
          <Route
            path="/analytics"
            element={<Analytics rows={data.rows} selector={data.selector} />}
          />
          <Route path="/definitions" element={<Definitions selector={data.selector} />} />
          <Route path="*" element={<Navigate to="/rawdata" replace />} />
        </Routes>
      </main>
    </>
  );
}
