// backend/services/apiRateLimiter.js
const NodeCache = require('node-cache');
const apiCallCache = new NodeCache({ stdTTL: 300 }); // 5-minute cache

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
    }
  }

  canMakeCall() {
    this.resetIfNewDay();
    return this.callsToday < this.dailyLimit;
  }

  async fetchWithCache(endpoint, cacheKey, cacheTTL = 300) {
    // Check cache first
    const cached = apiCallCache.get(cacheKey);
    if (cached) {
      console.log(`Cache HIT: ${cacheKey}`);
      return cached;
    }

    // Check rate limit
    if (!this.canMakeCall()) {
      throw new Error('Daily API limit reached. Try again tomorrow.');
    }

    // Make API call
    try {
      const response = await fetch(`https://api.cricketdata.org/${endpoint}`, {
        headers: { 'Authorization': `Bearer ${process.env.CRICKET_API_KEY}` }
      });
      
      const data = await response.json();
      this.callsToday++;
      this.callLog.push({ endpoint, timestamp: new Date(), success: true });
      
      // Cache the response
      apiCallCache.set(cacheKey, data, cacheTTL);
      
      return data;
    } catch (error) {
      this.callLog.push({ endpoint, timestamp: new Date(), success: false, error: error.message });
      throw error;
    }
  }

  getRemainingCalls() {
    this.resetIfNewDay();
    return this.dailyLimit - this.callsToday;
  }

  getCallLog() {
    return {
      used: this.callsToday,
      remaining: this.getRemainingCalls(),
      logs: this.callLog.slice(-20) // Last 20 calls
    };
  }
}

module.exports = new CricketAPIManager();
