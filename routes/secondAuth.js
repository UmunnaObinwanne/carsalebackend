import dotenv from 'dotenv';
dotenv.config(); // Load environment variables before anything else

import express from 'express';
const router = express.Router();

import passport from 'passport';
import querystring from 'query-string';

import pkg from 'express-openid-connect';
const { auth } = pkg;


const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'Agubush22018!!!',
  baseURL: 'http://localhost:5173/used-cars',
  clientID: 'EigdsvXH03hBGuc1rAuciSEwnsPxNVOT',
  issuerBaseURL: 'https://dev-typvqi6vwstel24q.us.auth0.com'
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
router.use(auth(config));

// req.isAuthenticated is provided from the auth router
router.get('/login', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});


export default router; 