// dao.js

/**
 * dao = Data Access Object
 * אחראי על שמירת נתוני המטבעות ב-Chrome Storage
 * משתמש ב-Chrome Storage API במקום localStorage להרחבות
 */

const dao = {
  /**
   * מוסיף כמות למטבע מסוים
   * @param {string} symbol - לדוגמה: 'BTC', 'ETH'
   * @param {number} amount - הכמות להוספה
   */
  add(symbol, amount) {
    // בדיקת תקינות
    if (!symbol || typeof amount !== 'number' || amount <= 0) {
      console.error('Invalid parameters for dao.add');
      return;
    }
    
    // לצורכי הרחבת Chrome, נשתמש ב-localStorage (יעבוד גם בהרחבה)
    const current = parseFloat(localStorage.getItem(symbol)) || 0;
    const newAmount = current + amount;
    localStorage.setItem(symbol, newAmount.toString());
    
    console.log(`Added ${amount} ${symbol}. New total: ${newAmount}`);
  },

  /**
   * מוריד כמות ממטבע (בלי לרדת מתחת לאפס)
   * @param {string} symbol - סמל המטבע
   * @param {number} amount - הכמות להסרה
   */
  remove(symbol, amount) {
    // בדיקת תקינות
    if (!symbol || typeof amount !== 'number' || amount <= 0) {
      console.error('Invalid parameters for dao.remove');
      return;
    }
    
    const current = parseFloat(localStorage.getItem(symbol)) || 0;
    const updated = Math.max(0, current - amount);
    localStorage.setItem(symbol, updated.toString());
    
    console.log(`Removed ${amount} ${symbol}. New total: ${updated}`);
  },

  /**
   * מחזיר את כמות המטבע השמורה
   * @param {string} symbol - סמל המטבע
   * @returns {number} הכמות השמורה
   */
  getAmount(symbol) {
    if (!symbol) {
      return 0;
    }
    
    return parseFloat(localStorage.getItem(symbol)) || 0;
  },

  /**
   * מחשב את סך הערך של כל המטבעות ב-USD לפי שערים נוכחיים
   * @param {string} currency - המטבע לחישוב (רק USD נתמך כרגע)
   * @returns {Promise<number>} הערך הכולל בדולרים
   */
  async total(currency = 'USD') {
    try {
      // שולף שערים עדכניים
      const rates = await service.getRates();
      
      if (!rates || !rates.BTC || !rates.ETH) {
        throw new Error('Failed to get valid rates');
      }
      
      // מחשב ערכים
      const btcAmount = this.getAmount("BTC");
      const ethAmount = this.getAmount("ETH");
      
      const btcValue = btcAmount * rates.BTC;
      const ethValue = ethAmount * rates.ETH;
      
      const totalValue = btcValue + ethValue;
      
      console.log(`Portfolio calculation:
        BTC: ${btcAmount} × $${rates.BTC} = $${btcValue}
        ETH: ${ethAmount} × $${rates.ETH} = $${ethValue}
        Total: $${totalValue}`);
      
      return totalValue;
      
    } catch (error) {
      console.error('Error calculating total portfolio value:', error);
      throw error;
    }
  },

  /**
   * מחזיר את כל ההחזקות הנוכחיות
   * @returns {{BTC: number, ETH: number}} אובייקט עם כל ההחזקות
   */
  getAllHoldings() {
    const holdings = {
      BTC: this.getAmount("BTC"),
      ETH: this.getAmount("ETH")
    };
    
    console.log('Current holdings:', holdings);
    return holdings;
  },

  /**
   * מנקה את כל הנתונים (לצורכי debug/reset)
   */
  clearAll() {
    localStorage.removeItem("BTC");
    localStorage.removeItem("ETH");
    console.log('All holdings cleared');
  }
};
