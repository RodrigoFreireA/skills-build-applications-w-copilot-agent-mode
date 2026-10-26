import { Activity, Team, User, Workout } from '../models/index.js';
import mongoose from 'mongoose';

function badRequest(message: string): never {
  throw Object.assign(new Error(message), { status: 400 });
}

function notFound(message: string): never {
  throw Object.assign(new Error(message), { status: 404 });
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object') badRequest('Activity payload is required');
  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  if (typeof userId !== 'string' || typeof teamId !== 'string' || typeof type !== 'string' || !type.trim() || typeof minutes !== 'number' || minutes <= 0) {
    badRequest('Activity requires userId, teamId, type, and positive minutes');
  }
  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(teamId)) badRequest('Activity references must be valid IDs');
  const [user, team] = await Promise.all([User.findById(userId), Team.findById(teamId)]);
  if (!user || !team) notFound('Activity user or team was not found');
  return Activity.create({
    user: userId,
    team: teamId,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object') badRequest('Team payload is required');
  const { name, mascot, members } = input as Record<string, unknown>;
  if (typeof name !== 'string' || !name.trim()) badRequest('Team name is required');
  if (typeof mascot !== 'string' || !mascot.trim()) badRequest('Team mascot is required');
  if (members !== undefined && (!Array.isArray(members) || members.some((member) => typeof member !== 'string' || !mongoose.isValidObjectId(member)))) {
    badRequest('Team members must be valid IDs');
  }
  return Team.create({ name: name.trim(), mascot: mascot.trim(), members: members ?? [] });
}

export async function getLeaderboard() {
  const totals = await Activity.aggregate<{ _id: mongoose.Types.ObjectId; totalPoints: number }>([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $sort: { totalPoints: -1 } },
  ]);
  const teams = await Team.find({ _id: { $in: totals.map(({ _id }) => _id) } }).lean();
  const names = new Map(teams.map((team) => [team._id.toString(), team.name]));
  return totals.map((total, index) => ({
    teamName: names.get(total._id.toString()) ?? 'Unknown team',
    totalPoints: total.totalPoints,
    rank: index + 1,
  }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) notFound('User was not found');
  const recentActivity = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const focus = user.fitnessGoal || recentActivity?.type;
  const workouts = await Workout.find(focus ? { focus } : {}).lean();
  const suggestions = workouts.length > 0 ? workouts : await Workout.find().limit(1).lean();
  return suggestions.map((workout) => ({
    ...workout,
    reason: focus ? `Recommended for your ${focus} goal and recent activity.` : 'Recommended from your recent activity.',
  }));
}

export { User };
