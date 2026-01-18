// backend/services/apiRateLimiter.js
const NodeCache = require('node-cache');

const apiCallCache = new NodeCache({ stdTTL: 300 });

class CricketAPIManager {
  constructor() {
    this.dailyLimit = 100;
    this.callsToday = 0;
    this.lastResetDate = new Date().toDateString();
    this.callLog = [];
  }

  resetIfNewDay() {
    const today = new Date().toDateString();
    if (today !== this.lastResetDate) {
      this.callsToday = 0;
      this.lastResetDate = today;
      this.callLog = [];
      console.log('✅ API call counter reset for new day');
    }
  }

  canMakeCall() {
    this.resetIfNewDay();
    return this.callsToday < this.dailyLimit;
  }

  async fetchWithCache(endpoint, cacheKey, cacheTTL = 300) {
    const cached = apiCallCache.get(cacheKey);
    if (cached) {
      console.log(`💾 Cache HIT: ${cacheKey}`);
      return cached;
    }

    if (!this.canMakeCall()) {
      throw new Error('Daily API limit reached (100/100). Try again tomorrow.');
    }

    try {
      const fetch = require('node-fetch');
      const url = `https://api.cricketdata.org/${endpoint}`;
      console.log(`🌐 API Call (${this.callsToday + 1}/100): ${endpoint}`);
      
      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${process.env.CRICKET_API_KEY}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      this.callsToday++;
      this.callLog.push({ 
        endpoint, 
        timestamp: new Date(), 
        success: true,
        cacheKey 
      });
      
      apiCallCache.set(cacheKey, data, cacheTTL);
      
      return data;
    } catch (error) {
      this.callLog.push({ 
        endpoint, 
        timestamp: new Date(), 
        success: false, 
        error: error.message 
      });
      throw error;
    }
  }

  getRemainingCalls() {
    this.resetIfNewDay();
    return this.dailyLimit - this.callsToday;
  }

  getCallLog() {
    this.resetIfNewDay();
    return {
      used: this.callsToday,
      remaining: this.getRemainingCalls(),
      limit: this.dailyLimit,
      logs: this.callLog.slice(-20)
    };
  }

  clearCache() {
    apiCallCache.flushAll();
    console.log('🗑️  Cache cleared');
  }
}

module.exports = new CricketAPIManager();
