// tests/mood.test.js
import { jest } from '@jest/globals';

// Define ES module mocks at the top of the file
jest.unstable_mockModule('../services/mood.service.js', () => ({
  createMoodEntry: jest.fn(),
  getMoodEntries: jest.fn(),
  getMoodById: jest.fn(),
  updateMoodEntry: jest.fn(),
  deleteMoodEntry: jest.fn(),
  calculateMoodAnalytics: jest.fn()
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    verify: jest.fn()
  }
}));

// Dynamically import the mocked modules and dependencies to ensure mocks are registered
const moodService = await import('../services/mood.service.js');
const jwt = (await import('jsonwebtoken')).default;
const app = (await import('../server.js')).default;
const request = (await import('supertest')).default;

describe('Mood CRUD and Analytics API Tests', () => {
  const mockUserId = '00000000-0000-0000-0000-000000000001';
  const mockToken = 'mock-bearer-token';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authorization Checks', () => {
    it('should return 401 Unauthorized if Authorization header is missing', async () => {
      const response = await request(app)
        .get('/api/moods')
        .expect(401);
        
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should return 401 Unauthorized if token verification fails', async () => {
      jwt.verify.mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .get('/api/moods')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(401);
        
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/moods (Create Mood)', () => {
    it('should log a new mood log successfully when payload is valid', async () => {
      jwt.verify.mockReturnValueOnce({ sub: mockUserId, role: 'user' });
      
      const mockResult = {
        id: 'mock-mood-id',
        user_id: mockUserId,
        mood: 'Anxious',
        mood_score: 5,
        stress_level: 7,
        sleep_quality: 6,
        energy_level: 5,
        note: 'Stressed about project presentation.'
      };
      
      moodService.createMoodEntry.mockResolvedValueOnce(mockResult);

      const response = await request(app)
        .post('/api/moods')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          mood: 'Anxious',
          mood_score: 5,
          stress_level: 7,
          sleep_quality: 6,
          energy_level: 5,
          note: 'Stressed about project presentation.'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('mock-mood-id');
      expect(moodService.createMoodEntry).toHaveBeenCalledWith(mockUserId, expect.any(Object));
    });

    it('should return 400 Bad Request if mood score is out of range (1-10)', async () => {
      jwt.verify.mockReturnValueOnce({ sub: mockUserId, role: 'user' });

      const response = await request(app)
        .post('/api/moods')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          mood: 'Happy',
          mood_score: 11, // Out of limits
          stress_level: 2,
          sleep_quality: 8,
          energy_level: 8
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
      expect(moodService.createMoodEntry).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/moods/analytics', () => {
    it('should return calculations trend arrays and average figures', async () => {
      jwt.verify.mockReturnValueOnce({ sub: mockUserId, role: 'user' });
      
      const mockAnalytics = {
        averages_7_day: {
          mood_score: 7.2,
          stress_level: 4.1,
          sleep_quality: 6.8,
          energy_level: 6.5
        },
        trend_30_day: [
          { date: '2026-06-14', mood_score: 7, mood: 'Calm' }
        ],
        streak_count: 5,
        distribution_histogram: { Calm: 3, Anxious: 1 }
      };
      
      moodService.calculateMoodAnalytics.mockResolvedValueOnce(mockAnalytics);

      const response = await request(app)
        .get('/api/moods/analytics')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.streak_count).toBe(5);
      expect(response.body.data.averages_7_day.mood_score).toBe(7.2);
    });
  });
});
