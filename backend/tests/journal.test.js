// tests/journal.test.js
import { jest } from '@jest/globals';

// Define ES module mocks at the top of the file
jest.unstable_mockModule('../services/journal.service.js', () => ({
  createJournalEntry: jest.fn(),
  getJournalEntries: jest.fn(),
  getJournalById: jest.fn(),
  updateJournalEntry: jest.fn(),
  deleteJournalEntry: jest.fn(),
  searchUserJournalsFullText: jest.fn()
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    verify: jest.fn()
  }
}));

// Dynamically import the mocked modules and dependencies to ensure mocks are registered
const journalService = await import('../services/journal.service.js');
const jwt = (await import('jsonwebtoken')).default;
const app = (await import('../server.js')).default;
const request = (await import('supertest')).default;

describe('Journal CRUD and Search API Tests', () => {
  const mockUserId = '00000000-0000-0000-0000-000000000001';
  const mockToken = 'mock-bearer-token';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/journals (Create Journal)', () => {
    it('should log a new journal successfully when parameters are valid', async () => {
      jwt.verify.mockReturnValueOnce({ sub: mockUserId, role: 'user' });
      
      const mockResult = {
        id: 'mock-journal-id',
        user_id: mockUserId,
        title: 'Morning Reflections',
        content: 'I woke up feeling relaxed after a long sleep.',
        tags: ['sleep', 'calm']
      };
      
      journalService.createJournalEntry.mockResolvedValueOnce(mockResult);

      const response = await request(app)
        .post('/api/journals')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          title: 'Morning Reflections',
          content: 'I woke up feeling relaxed after a long sleep.',
          tags: ['sleep', 'calm']
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('mock-journal-id');
      expect(journalService.createJournalEntry).toHaveBeenCalledWith(mockUserId, expect.any(Object));
    });

    it('should return 400 Bad Request if content is less than 10 characters', async () => {
      jwt.verify.mockReturnValueOnce({ sub: mockUserId, role: 'user' });

      const response = await request(app)
        .post('/api/journals')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          title: 'Bad content',
          content: 'Short' // Too short (min 10)
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
      expect(journalService.createJournalEntry).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/journals/search (Full-Text Search)', () => {
    it('should invoke RPC search function and return ranked matches', async () => {
      jwt.verify.mockReturnValueOnce({ sub: mockUserId, role: 'user' });
      
      const mockSearchResults = [
        {
          id: 'mock-journal-id-1',
          title: 'Placement Preparation',
          content: 'Working on mock interviews and placement problems.',
          snippet: 'Working on mock interviews and <b>placement</b> problems.',
          rank: 0.85,
          created_at: '2026-06-15T15:00:00.000Z'
        }
      ];
      
      journalService.searchUserJournalsFullText.mockResolvedValueOnce(mockSearchResults);

      const response = await request(app)
        .get('/api/journals/search?q=placement')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].rank).toBe(0.85);
      expect(response.body.data[0].snippet).toContain('<b>placement</b>');
      expect(journalService.searchUserJournalsFullText).toHaveBeenCalledWith(mockUserId, 'placement');
    });

    it('should return 400 Bad Request if search keyword query is missing', async () => {
      jwt.verify.mockReturnValueOnce({ sub: mockUserId, role: 'user' });

      const response = await request(app)
        .get('/api/journals/search?q=') // Empty query
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });
  });
});
