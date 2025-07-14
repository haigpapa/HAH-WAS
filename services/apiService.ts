
import { LeaderboardEntry } from "../types";

// This is a mock API service. In a real application, these functions
// would make HTTP requests to a backend server (e.g., Firebase, Supabase).

/**
 * Mocks submitting a score to the backend.
 * @param username The player's username.
 * @param score The player's final score for the round.
 * @param time_taken The total time taken for the quiz.
 */
export const submitScore = async (username: string, score: number, time_taken: number): Promise<{ success: boolean }> => {
  console.log('Mock API: Submitting score...', { username, score, time_taken });
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Mock API: Score submitted successfully.');
  return { success: true };
};

/**
 * Mocks fetching the daily leaderboard from the backend.
 */
export const fetchDailyLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  console.log('Mock API: Fetching daily leaderboard...');
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Generate some mock data
  const mockData: LeaderboardEntry[] = [
    { rank: 1, username: 'سيد الأوهام', score: 8, isCurrentUser: false },
    { rank: 2, username: 'مكتشف الحقائق', score: 8, isCurrentUser: false },
    { rank: 3, username: 'نجمة الصباح', score: 7, isCurrentUser: false },
    { rank: 4, username: 'الباحث_99', score: 7, isCurrentUser: false },
    { rank: 5, username: 'أنت', score: 6, isCurrentUser: true }, // Example current user
    { rank: 6, username: 'ظل المعرفة', score: 6, isCurrentUser: false },
    { rank: 7, username: 'صقر الصحراء', score: 5, isCurrentUser: false },
    { rank: 8, username: 'نور', score: 5, isCurrentUser: false },
    { rank: 9, username: 'المحقق', score: 4, isCurrentUser: false },
    { rank: 10, username: 'مسافر عبر الزمن', score: 3, isCurrentUser: false },
  ];
  
  console.log('Mock API: Leaderboard data fetched.');
  return mockData;
};
