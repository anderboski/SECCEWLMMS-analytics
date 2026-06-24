import ScoreTimeGraph from '../charts/ScoreTimeGraph.jsx';
import SportBarChart from '../charts/SportBarChart.jsx';

export default function Analytics({ rows, selector }) {
  return (
    <div>
      <h1>Analytics</h1>
      <ScoreTimeGraph rows={rows} />
      <SportBarChart rows={rows} selector={selector} />
    </div>
  );
}
