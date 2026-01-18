// backend/middleware/auth.js
const { createClient } = require('@supabase/supabase-js');
const User = require('../models/User');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function verifyAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data || !data.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    const user = data.user;
    
    let dbUser = await User.findOne({ supabaseId: user.id });
    
    if (!dbUser) {
      dbUser = await User.create({
        supabaseId: user.id,
        email: user.email,
        displayName: user.user_metadata?.full_name || user.email.split('@')[0],
        avatar: user.user_metadata?.avatar_url
      });
    }
    
    req.user = user;
    req.dbUser = dbUser;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

async function verifyAdmin(req, res, next) {
  await verifyAuth(req, res, () => {
    if (!req.dbUser || !req.dbUser.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
}

module.exports = { verifyAuth, verifyAdmin };
