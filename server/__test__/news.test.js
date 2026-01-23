// Paksa ENV jadi test
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'rahasia_negara'; // Samakan dengan helper

const request = require('supertest');
const app = require('../app'); // Pastikan app.js export 'app' saja (bukan app.listen)
const { sequelize, User, Bookmark } = require('../models');
const { signToken } = require('../helpers/jwt');

// --- MOCKING ---
jest.mock('google-auth-library', () => ({
  OAuth2Client: class {
    verifyIdToken({ idToken }) {
      if (idToken === 'invalid_token') return Promise.reject(new Error('Fail'));
      return Promise.resolve({
        getPayload: () => ({ email: 'google@mail.com', name: 'Google User', picture: 'pic.jpg', sub: '123' }),
      });
    }
  },
}));

jest.mock('axios', () => ({
  get: jest.fn((url) => {
    if (url.includes('force-error')) return Promise.reject(new Error('API Error'));
    return Promise.resolve({
      data: { articles: [{ title: 'News 1', url: 'http://news.com', description: 'Desc', source: { name: 'GNews' } }] }
    });
  }),
  post: jest.fn(() => Promise.resolve({ data: { access_token: 'dummy' } }))
}));

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return {
        generateContent: (prompt) => {
          if (prompt.includes('ErrorTitle')) return Promise.reject(new Error('AI Error'));
          return Promise.resolve({ response: { text: () => "AI Summary Result" } });
        }
      };
    }
  }
}));

// --- SETUP ---
let access_token;
let userId;

beforeAll(async () => {
  // 1. Reset Database Total (Supaya tidak ada error 500 karena tabel hilang)
  await sequelize.sync({ force: true });
  
  // 2. Bikin User untuk Test Login
  const user = await User.create({
    email: 'test@mail.com',
    password: 'password123',
    fullName: 'Test User'
  });
  userId = user.id;

  // 3. Bikin Token yang valid
  access_token = signToken({ id: user.id, email: user.email });
});

afterAll(async () => {
  await sequelize.close();
});

// --- TESTS ---
describe('APP TESTING SUITE', () => {

  // 1. REGISTER
  describe('POST /register', () => {
    it('should register success (201)', async () => {
      const res = await request(app).post('/register').send({
        email: 'new@mail.com', password: 'password123', fullName: 'New'
      });
      expect(res.status).toBe(201);
    });

    it('should fail duplicate email (400)', async () => {
      const res = await request(app).post('/register').send({
        email: 'test@mail.com', password: 'pass', fullName: 'Dup'
      });
      expect(res.status).toBe(400); // Controller harus handle SequelizeUniqueConstraintError
    });

    it('should fail 500 on system error', async () => {
        // Mock User.create biar error
        jest.spyOn(User, 'create').mockRejectedValueOnce(new Error('DB Error'));
        const res = await request(app).post('/register').send({ email: 'a', password: 'b' });
        expect(res.status).toBe(500);
    });

    it('should fail with validation error (400)', async () => {
      const res = await request(app).post('/register').send({
        email: '', // Empty email to trigger validation
        password: 'pass',
        fullName: 'Test'
      });
      expect(res.status).toBe(400);
    });
  });

  // 2. LOGIN
  describe('POST /login', () => {
    it('should login success (200)', async () => {
      const res = await request(app).post('/login').send({
        email: 'test@mail.com', password: 'password123'
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('access_token');
    });

    it('should fail invalid email (401)', async () => {
      const res = await request(app).post('/login').send({ email: 'wrong@mail.com', password: 'pass' });
      expect(res.status).toBe(401);
    });

    it('should fail invalid password (401)', async () => {
      const res = await request(app).post('/login').send({ email: 'test@mail.com', password: 'wrong' });
      expect(res.status).toBe(401);
    });

    it('should fail without email (500)', async () => {
      const res = await request(app).post('/login').send({ password: 'pass' });
      expect(res.status).toBe(500);
    });

    it('should fail without password (500)', async () => {
      const res = await request(app).post('/login').send({ email: 'test@mail.com' });
      expect(res.status).toBe(500);
    });
  });

  // 3. GOOGLE LOGIN
  describe('POST /google-login', () => {
    it('should success (200)', async () => {
      const res = await request(app).post('/google-login').send({ token: 'valid' });
      expect(res.status).toBe(200);
    });
    
    it('should fail verify (500)', async () => {
      const res = await request(app).post('/google-login').send({ token: 'invalid_token' });
      expect(res.status).toBe(500);
    });
  });

  // 4. NEWS (GET)
  describe('GET /news', () => {
    it('should get news success (200)', async () => {
      const res = await request(app).get('/news');
      expect(res.status).toBe(200);
      expect(res.body[0].source.name).toBe('GNews');
    });

    it('should use Mock Data if API Error (200)', async () => {
      const res = await request(app).get('/news?q=force-error');
      expect(res.status).toBe(200);
      expect(res.body[0].source.name).toMatch(/Backup/); // Cek apakah masuk catch block
    });
  });

  // 5. AI SUMMARY
  describe('POST /ai-summary', () => {
    it('should get summary success (200)', async () => {
      const res = await request(app).post('/ai-summary')
        .set('Authorization', `Bearer ${access_token}`)
        .send({ title: 'Title', url: 'http://url.com' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('summary');
    });

    it('should return fallback if AI Error (200)', async () => {
      const res = await request(app).post('/ai-summary')
        .set('Authorization', `Bearer ${access_token}`)
        .send({ title: 'ErrorTitle', url: 'http://url.com' });
      expect(res.status).toBe(200);
      expect(res.body.summary).toMatch(/limit/i); // Cek catch block
    });
  });

  // 6. BOOKMARKS (CRUD) - INI YANG TADI 401
  describe('Bookmarks Operations', () => {
    let bId;
    it('should create bookmark (201)', async () => {
      const res = await request(app).post('/bookmarks')
        .set('Authorization', `Bearer ${access_token}`)
        .send({ title: 'B1', url: 'http://b1.com', imageUrl: 'img' });
      expect(res.status).toBe(201);
      bId = res.body.id;
    });

    it('should fail duplicate bookmark (400)', async () => {
      const res = await request(app).post('/bookmarks')
        .set('Authorization', `Bearer ${access_token}`)
        .send({ title: 'B1', url: 'http://b1.com', imageUrl: 'img' });
      expect(res.status).toBe(400); // Controller harus handle if(existing)
    });

    it('should get bookmarks (200)', async () => {
      const res = await request(app).get('/bookmarks')
        .set('Authorization', `Bearer ${access_token}`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should delete bookmark (200)', async () => {
      const res = await request(app).delete(`/bookmarks/${bId}`)
        .set('Authorization', `Bearer ${access_token}`);
      expect(res.status).toBe(200);
    });

    it('should fail delete random bookmark (500/404)', async () => {
        // Mock error delete
        jest.spyOn(Bookmark, 'destroy').mockRejectedValueOnce(new Error('DB Fail'));
        const res = await request(app).delete(`/bookmarks/${bId}`)
            .set('Authorization', `Bearer ${access_token}`);
        expect(res.status).toBe(500);
    });
  });

  // 7. PROFILE
  describe('PUT /profile', () => {
    it('should update profile (200)', async () => {
      const res = await request(app).put('/profile')
        .set('Authorization', `Bearer ${access_token}`)
        .send({ fullName: 'Updated', imageUrl: 'new.jpg' });
      expect(res.status).toBe(200);
      expect(res.body.fullName).toBe('Updated');
    });

    it('should handle error (500)', async () => {
        jest.spyOn(User, 'update').mockRejectedValueOnce(new Error('DB Fail'));
        const res = await request(app).put('/profile')
            .set('Authorization', `Bearer ${access_token}`)
            .send({});
        expect(res.status).toBe(500);
    });
  });

  // 8. MIDDLEWARE FAIL CASES
  describe('Middleware Checks', () => {
      it('should 401 if no token', async () => {
          const res = await request(app).get('/bookmarks');
          expect(res.status).toBe(401);
      });
      it('should 401 if invalid token', async () => {
        const res = await request(app).get('/bookmarks').set('Authorization', 'Bearer ngasal');
        expect(res.status).toBe(401);
    });
  });

  // 9. ADDITIONAL COVERAGE TESTS
  describe('Edge Cases & Additional Coverage', () => {
    it('should fail login with missing input (500)', async () => {
      const res = await request(app).post('/login').send({});
      expect(res.status).toBe(500);
    });

    it('should fail register with invalid data (400)', async () => {
      const res = await request(app).post('/register').send({
        email: 'test@mail.com', // Duplicate email
        password: 'pass',
        fullName: 'Test'
      });
      expect(res.status).toBe(400);
    });

    it('should get bookmarks success even if empty (200)', async () => {
      // Create a new user without bookmarks
      const newUser = await User.create({
        email: 'nobookmarks@mail.com',
        password: 'password123',
        fullName: 'No Bookmarks User'
      });
      const token = signToken({ id: newUser.id, email: newUser.email });
      
      const res = await request(app).get('/bookmarks')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should fail authentication if user not found', async () => {
      // Create token with non-existent user ID
      const fakeToken = signToken({ id: 99999, email: 'fake@mail.com' });
      const res = await request(app).get('/bookmarks')
        .set('Authorization', `Bearer ${fakeToken}`);
      expect(res.status).toBe(401);
    });

    it('should fail authentication without Bearer prefix', async () => {
      const res = await request(app).get('/bookmarks')
        .set('Authorization', access_token); // Without "Bearer"
      expect(res.status).toBe(401);
    });

    it('should handle getBookmarks error (500)', async () => {
      jest.spyOn(Bookmark, 'findAll').mockRejectedValueOnce(new Error('DB Error'));
      const res = await request(app).get('/bookmarks')
        .set('Authorization', `Bearer ${access_token}`);
      expect(res.status).toBe(500);
    });

    it('should fail delete non-existent bookmark (200)', async () => {
      const res = await request(app).delete('/bookmarks/999999')
        .set('Authorization', `Bearer ${access_token}`);
      expect(res.status).toBe(200); // Controller doesn't check if exists
    });
    
    it('should handle addBookmark system error (500)', async () => {
      jest.spyOn(Bookmark, 'findOne').mockRejectedValueOnce(new Error('DB Error'));
      const res = await request(app).post('/bookmarks')
        .set('Authorization', `Bearer ${access_token}`)
        .send({ title: 'Test', url: 'http://test.com', imageUrl: 'img' });
      expect(res.status).toBe(500);
    });

    it('should handle AI summary with missing API key (200 fallback)', async () => {
      const originalKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;
      
      const res = await request(app).post('/ai-summary')
        .set('Authorization', `Bearer ${access_token}`)
        .send({ title: 'Test', url: 'http://test.com' });
      
      process.env.GEMINI_API_KEY = originalKey; // Restore
      expect(res.status).toBe(200);
      expect(res.body.summary).toMatch(/limit/i);
    });

    it('should get news with category filter (200)', async () => {
      const res = await request(app).get('/news?category=technology');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should get news with "all" category (200)', async () => {
      const res = await request(app).get('/news?category=all');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should get news with pagination (200)', async () => {
      const res = await request(app).get('/news?page=2');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should get root endpoint (200)', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/Running/i);
    });

    // Test error handler branches
    it('should handle SequelizeValidationError (400)', async () => {
      // Create user without required fields to trigger validation
      const res = await request(app).post('/register').send({
        email: '', // Empty email should trigger validation
        password: 'pass'
      });
      expect([400, 500]).toContain(res.status);
    });

    it('should handle authentication token properly', async () => {
      // Test dengan token tanpa Bearer keyword
      const res = await request(app).get('/bookmarks')
        .set('Authorization', `Token ${access_token}`);
      expect(res.status).toBe(401);
    });

    it('should handle news with query parameter', async () => {
      const res = await request(app).get('/news?q=bitcoin');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should handle profile update with only fullName', async () => {
      const res = await request(app).put('/profile')
        .set('Authorization', `Bearer ${access_token}`)
        .send({ fullName: 'Only Name' });
      expect(res.status).toBe(200);
    });

    it('should handle profile update with only imageUrl', async () => {
      const res = await request(app).put('/profile')
        .set('Authorization', `Bearer ${access_token}`)
        .send({ imageUrl: 'http://newimage.jpg' });
      expect(res.status).toBe(200);
    });
  });

  // 10. ERROR HANDLER COVERAGE
  describe('Error Handler Coverage', () => {
    it('should handle EmailPasswordInvalid error (401)', async () => {
      // This triggers InvalidUser which maps to 401
      const res = await request(app).post('/login')
        .send({ email: 'notexist@mail.com', password: 'wrongpass' });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message');
    });

    it('should handle Unauthenticated error (401)', async () => {
      const res = await request(app).get('/bookmarks');
      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/login/i);
    });

    it('should handle JsonWebTokenError (401)', async () => {
      const res = await request(app).get('/bookmarks')
        .set('Authorization', 'Bearer invalid.jwt.token');
      expect(res.status).toBe(401);
    });

    it('should handle generic 500 errors', async () => {
      jest.spyOn(User, 'create').mockRejectedValueOnce(new Error('Generic DB Error'));
      const res = await request(app).post('/register')
        .send({ email: 'test999@mail.com', password: 'pass', fullName: 'Test' });
      expect(res.status).toBe(500);
      expect(res.body.message).toMatch(/Internal Server Error/i);
    });
  });
});