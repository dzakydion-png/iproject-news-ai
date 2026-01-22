const express = require('express');
const router = express.Router();
const Controller = require('../controllers/Controller'); 
const authentication = require('../middlewares/authentication');

// --- PUBLIC ROUTES  ---
router.get('/', (req, res) => res.status(200).json({ message: "Server AI News is Running!" }));
// --- 1. ROUTES PUBLIC  ---
router.post('/register', Controller.register);
router.post('/login', Controller.login);
router.post('/google-login', Controller.googleLogin);
router.get('/news', Controller.getNews); 

router.use(authentication); 

// --- 3. ROUTES PRIVATE ---
router.post('/ai-summary', Controller.getAiSummary);
router.post('/bookmarks', Controller.addBookmark);
router.get('/bookmarks', Controller.getBookmarks);
router.delete('/bookmarks/:id', Controller.deleteBookmark);
router.put('/profile', Controller.updateProfile);

module.exports = router;