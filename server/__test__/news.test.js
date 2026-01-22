const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models');

// 1. Mock Google Auth
jest.mock('google-auth-library', () => ({
  OAuth2Client: class {
    verifyIdToken({ idToken }) {
      if (!idToken) return Promise.reject(new Error('Token missing')); 
      return Promise.resolve({
        getPayload: () => ({
          email: 'test@mail.com',
          name: 'Test User',
          sub: '123456'
        }),
      });
    }
  },
}));

// 2. Mock Axios
jest.mock('axios', () => ({
  get: jest.fn((url) => {
    if (url.includes('error')) return Promise.reject(new Error('API Error')); 
    return Promise.resolve({
      data: {
        articles: [{ title: 'Berita Test 1', url: 'https://test.com/1', urlToImage: 'img.jpg' }]
      }
    });
  }),
  post: jest.fn(() => Promise.resolve({ data: { access_token: 'dummy_token' } }))
}));

// 3. Mock Gemini
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return {
        generateContent: () => Promise.resolve({
          response: { text: () => "Ini ringkasan AI dummy." }
        })
      };
    }
  }
}));

// --- SETUP & TEARDOWN ---
let access_token;

beforeAll(async () => {
  await sequelize.queryInterface.bulkDelete('Users', null, { truncate: true, cascade: true, restartIdentity: true });
  await sequelize.queryInterface.bulkDelete('Bookmarks', null, { truncate: true, cascade: true, restartIdentity: true });
  
  // Create User Manual & Token untuk kebutuhan test
  const user = await sequelize.models.User.create({
    email: 'test@mail.com',
    password: 'password',
    fullName: 'Test User'
  });
  
  const jwt = require('jsonwebtoken');
  access_token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'rahasia');
});

afterAll(async () => {
  await sequelize.close();
});

// --- TESTING START ---

describe('Succes Cases', () => {
  it('POST /google-login - should return token', async () => {
    const res = await request(app).post('/google-login').send({ token: 'dummy_google_token' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('access_token');
  });

  it('GET /news - should return news list', async () => {
    const res = await request(app).get('/news');
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('POST /ai-summary - should return summary', async () => {
    const res = await request(app)
      .post('/ai-summary')
      .set('Authorization', `Bearer ${access_token}`)
      .send({ title: 'Test', url: 'http://test.com' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('summary');
  });

  it('POST /bookmarks - should create bookmark', async () => {
    const res = await request(app)
      .post('/bookmarks')
      .set('Authorization', `Bearer ${access_token}`)
      .send({ title: 'My News', url: 'http://test.com', imageUrl: 'img.jpg', summary: 'Good' });
    expect(res.status).toBe(201);
  });

  it('GET /bookmarks - should fetch bookmarks', async () => {
    const res = await request(app)
      .get('/bookmarks')
      .set('Authorization', `Bearer ${access_token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });
});

describe('Failure Cases (Untuk Coverage)', () => {
  // 1. Login Tanpa Token 
  it('POST /google-login without token - should return 401/500', async () => {
    const res = await request(app).post('/google-login').send({}); 
    expect(res.status).not.toBe(200); 
  });

  // 2. Auth Error 
  it('GET /bookmarks without token - should return 401', async () => {
    const res = await request(app).get('/bookmarks');
    expect(res.status).toBe(401);
  });

  it('GET /bookmarks with invalid token - should return 401', async () => {
    const res = await request(app).get('/bookmarks').set('Authorization', 'Bearer ngasal');
    expect(res.status).toBe(401);
  });

  it('POST /bookmarks with empty data - should return 400', async () => {
    const res = await request(app)
      .post('/bookmarks')
      .set('Authorization', `Bearer ${access_token}`)
      .send({});
    
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

});