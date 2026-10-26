import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Entry = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<Entry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJson<{ leaderboard: Entry[] }>('/api/leaderboard').then((data) => setLeaderboard(data.leaderboard)).catch(() => setError('Unable to load leaderboard.'));
  }, []);

  return <section className="card h-100"><div className="card-body"><h2 className="h4">Leaderboard</h2><p>Compare team point totals.</p>{leaderboard === null && !error && <p role="status">Loading leaderboard...</p>}{error && <p role="alert">{error}</p>}{leaderboard?.length === 0 && <p>No leaderboard scores yet.</p>}{leaderboard && leaderboard.length > 0 && <ol>{leaderboard.map((entry) => <li key={entry.teamName}>{entry.teamName}: {entry.totalPoints} points</li>)}</ol>}</div></section>;
}
