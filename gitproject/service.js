// service.js

/**
 * service = אחראי על שליפת שערים בזמן אמת ממקור חיצוני (CoinGecko API)
 * מספק נתוני מחירים עדכניים למטבעות וירטואליים
 */

const service = {
  /**
   * כתובת ה-API של CoinGecko
   * @type {string}
   * @private
   */
  _apiUrl: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd',

  /**
   * זמן תוקף למטמון (5 דקות)
   * @type {number}
   * @private
   */
  _cacheTimeout: 5 * 60 * 1000,

  /**
   * מטמון עבור שערים
   * @type {Object}
   * @private
   */
  _cache: {
    data: null,
    timestamp: 0
  },

  /**
   * מחזיר שערים עדכניים של BTC ו-ETH בדולרים
   * משתמש במטמון כדי לא לעמוס על ה-API
   * @returns {Promise<{BTC: number, ETH: number}>} אובייקט עם שערי המטבעות
   */
  async getRates() {
    try {
      // בודק אם יש נתונים במטמון שעדיין תקפים
      const now = Date.now();
      if (this._cache.data && (now - this._cache.timestamp) < this._cacheTimeout) {
        console.log('Using cached rates');
        return this._cache.data;
      }

      console.log('Fetching fresh rates from API...');
      
      // שולף נתונים חדשים מה-API
      const response = await fetch(this._apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // בדיקת תקינות הנתונים
      if (!data || !data.bitcoin || !data.ethereum || 
          typeof data.bitcoin.usd !== 'number' || 
          typeof data.ethereum.usd !== 'number') {
        throw new Error('Invalid data format received from API');
      }
      
      // מכין את הנתונים בפורמט הנדרש
      const rates = {
        BTC: data.bitcoin.usd,
        ETH: data.ethereum.usd
      };
      
      // שומר במטמון
      this._cache.data = rates;
      this._cache.timestamp = now;
      
      console.log('Fresh rates loaded:', rates);
      return rates;
      
    } catch (error) {
      console.error("Failed to fetch rates from API:", error);
      
      // במקרה של שגיאה, אם יש נתונים במטמון - מחזיר אותם
      if (this._cache.data) {
        console.log('Using cached rates due to API error');
        return this._cache.data;
      }
      
      // במקרה שאין מטמון, מחזיר ערכים ברירת מחדל
      console.log('Returning default rates due to complete failure');
      return {
        BTC: 0,
        ETH: 0
      };
    }
  },

  /**
   * מנקה את המטמון (לצורכי debug)
   */
  clearCache() {
    this._cache.data = null;
    this._cache.timestamp = 0;
    console.log('Service cache cleared');
  },

  /**
   * בודק אם השירות זמין
   * @returns {Promise<boolean>} true אם השירות זמין
   */
  async isAvailable() {
    try {
      const rates = await this.getRates();
      return rates.BTC > 0 && rates.ETH > 0;
    } catch {
      return false;
    }
  }
};
