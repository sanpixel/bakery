const { Pool } = require('pg');

// Use the same database connection as main app
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const DISCOUNT_CODES_TABLE = 'codewallet_discount_codes';

/**
 * Discount Code Service
 * Handles all database operations for discount codes
 */
class DiscountCodeService {
  
  /**
   * Get all discount codes for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of discount codes
   */
  async getUserCodes(userId) {
    try {
      const result = await pool.query(
        `SELECT * FROM ${DISCOUNT_CODES_TABLE} WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching user codes:', error);
      throw error;
    }
  }

  /**
   * Save a new discount code for a user
   * @param {string} userId - User ID
   * @param {string} corporateName - Corporate name (e.g., "GE", "IBM")
   * @param {string} codeValue - The discount code value
   * @param {string} notes - Optional notes
   * @returns {Promise<Object>} Created discount code
   */
  async saveUserCode(userId, corporateName, codeValue, notes = null) {
    try {
      if (!codeValue) {
        throw new Error('Code value is required');
      }

      const result = await pool.query(
        `INSERT INTO ${DISCOUNT_CODES_TABLE} (user_id, corporate_name, code_value, notes) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [userId, corporateName, codeValue, notes]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error saving user code:', error);
      throw error;
    }
  }

  /**
   * Delete a discount code
   * @param {string} userId - User ID (for security)
   * @param {number} codeId - Code ID to delete
   * @returns {Promise<Object>} Deleted code or null if not found
   */
  async deleteUserCode(userId, codeId) {
    try {
      const result = await pool.query(
        `DELETE FROM ${DISCOUNT_CODES_TABLE} WHERE id = $1 AND user_id = $2 RETURNING *`,
        [codeId, userId]
      );
      
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error deleting user code:', error);
      throw error;
    }
  }

  /**
   * Get codes by corporate name (for searching)
   * @param {string} userId - User ID
   * @param {string} corporateName - Corporate name to search for
   * @returns {Promise<Array>} Array of matching codes
   */
  async getCodesByCorporate(userId, corporateName) {
    try {
      const result = await pool.query(
        `SELECT * FROM ${DISCOUNT_CODES_TABLE} 
         WHERE user_id = $1 AND LOWER(corporate_name) = LOWER($2)
         ORDER BY created_at DESC`,
        [userId, corporateName]
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching codes by corporate:', error);
      throw error;
    }
  }

  /**
   * Update discount code notes
   * @param {string} userId - User ID
   * @param {number} codeId - Code ID
   * @param {string} notes - New notes
   * @returns {Promise<Object>} Updated code or null if not found
   */
  async updateCodeNotes(userId, codeId, notes) {
    try {
      const result = await pool.query(
        `UPDATE ${DISCOUNT_CODES_TABLE} 
         SET notes = $1, updated_at = NOW() 
         WHERE id = $2 AND user_id = $3 RETURNING *`,
        [notes, codeId, userId]
      );
      
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error updating code notes:', error);
      throw error;
    }
  }
}

module.exports = new DiscountCodeService();