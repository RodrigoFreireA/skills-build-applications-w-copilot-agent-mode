import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Workout = { title: string; reason?: string; focus?: string };

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<Workout[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJson<{ suggestions: Workout[] }>(`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`).then((data) => setSuggestions(data.suggestions)).catch(() => setError('Unable to load workout suggestions.'));
  }, []);

  return <section className="card h-100"><div className="card-body"><h2 className="h4">Workout suggestions</h2><p>Recommend workouts from activity patterns.</p>{suggestions === null && !error && <p role="status">Loading workout suggestions...</p>}{error && <p role="alert">{error}</p>}{suggestions?.length === 0 && <p>No workout suggestions yet.</p>}{suggestions && suggestions.length > 0 && <ul>{suggestions.map((workout) => <li key={workout.title}>{workout.title}{workout.focus ? ` (${workout.focus})` : ''}{workout.reason ? `: ${workout.reason}` : ''}</li>)}</ul>}</div></section>;
}
