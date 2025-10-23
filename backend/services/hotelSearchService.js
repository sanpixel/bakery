const aiAssistantService = require('./aiAssistantService');
const discountCodeService = require('./discountCodeService');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const HOTEL_SEARCHES_TABLE = 'codewallet_hotel_searches';
const HOTEL_RATES_TABLE = 'codewallet_hotel_rates';

/**
 * Hotel Search Service
 * Orchestrates hotel searches across multiple brands and manages results
 */
class HotelSearchService {
  constructor() {
    this.adapters = new Map();
  }

  /**
   * Register a hotel adapter (Hilton, Marriott, etc.)
   * @param {string} brand - Brand name (hilton, marriott)
   * @param {Object} adapter - Adapter instance
   */
  registerAdapter(brand, adapter) {
    this.adapters.set(brand, adapter);
    console.log(`✅ Registered ${brand} adapter`);
  }

  /**
   * Perform hotel search with discount codes
   * @param {Object} searchParams - Search parameters
   * @param {string} userId - User ID for saving results
   * @returns {Promise<Object>} Search results with AI summary
   */
  async searchHotels(searchParams, userId) {
    try {
      console.log('🔍 Starting hotel search:', searchParams);

      // Parse natural language if provided
      let parsedParams = searchParams;
      if (searchParams.naturalLanguageQuery) {
        console.log('🤖 Parsing natural language query...');
        const aiParsed = await aiAssistantService.parseNaturalLanguageSearch(searchParams.naturalLanguageQuery);
        parsedParams = { ...searchParams, ...aiParsed };
      }

      // Get user's discount codes
      const userCodes = await discountCodeService.getUserCodes(userId);
      const discountCodes = userCodes.map(code => code.code_value);
      
      console.log(`📋 Found ${discountCodes.length} discount codes for user`);

      // Save search to database
      const searchRecord = await this.saveSearchRecord(userId, parsedParams, discountCodes);
      
      // Search across all registered adapters
      const allResults = [];
      
      for (const [brand, adapter] of this.adapters) {
        try {
          console.log(`🏨 Searching ${brand} properties...`);
          const brandResults = await adapter.searchHotels(parsedParams, discountCodes);
          
          // Add brand context to results
          const enhancedResults = brandResults.map(result => ({
            ...result,
            parent_company: brand,
            search_id: searchRecord.id
          }));
          
          allResults.push(...enhancedResults);
          console.log(`✅ Found ${brandResults.length} results from ${brand}`);
          
        } catch (adapterError) {
          console.error(`❌ Error searching ${brand}:`, adapterError.message);
          // Continue with other adapters even if one fails
        }
      }

      // Save all results to database
      await this.saveSearchResults(searchRecord.id, allResults);

      // Find best rate and calculate savings
      const bestRate = this.findBestRate(allResults);
      const totalSavings = this.calculateTotalSavings(allResults);

      // Generate AI summary
      let aiSummary = null;
      try {
        aiSummary = await aiAssistantService.summarizeResults(allResults, discountCodes);
      } catch (aiError) {
        console.error('AI summary failed:', aiError.message);
        aiSummary = {
          summary: `Found ${allResults.length} hotel options across ${this.adapters.size} brands.`,
          bestDeal: bestRate ? `Best rate: ${bestRate.hotel_name} at $${bestRate.discounted_rate}` : 'No rates found.',
          savings: `Total potential savings: $${totalSavings}`,
          recommendations: ['Compare rates across different dates', 'Check cancellation policies']
        };
      }

      const searchResults = {
        searchId: searchRecord.id,
        totalResults: allResults.length,
        bestRate: bestRate,
        totalSavings: totalSavings,
        results: allResults,
        aiSummary: aiSummary,
        searchParams: parsedParams,
        timestamp: new Date().toISOString()
      };

      console.log(`🎉 Search completed: ${allResults.length} results found`);
      return searchResults;

    } catch (error) {
      console.error('❌ Hotel search failed:', error);
      throw error;
    }
  }

  /**
   * Save search record to database
   * @param {string} userId - User ID
   * @param {Object} searchParams - Search parameters
   * @param {Array} discountCodes - Codes used in search
   * @returns {Promise<Object>} Saved search record
   */
  async saveSearchRecord(userId, searchParams, discountCodes) {
    try {
      const result = await pool.query(
        `INSERT INTO ${HOTEL_SEARCHES_TABLE} 
         (user_id, search_location, check_in_date, check_out_date, guest_count, codes_used) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          userId,
          searchParams.location || '',
          searchParams.checkIn || null,
          searchParams.checkOut || null,
          searchParams.guests || 1,
          JSON.stringify(discountCodes)
        ]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error saving search record:', error);
      throw error;
    }
  }

  /**
   * Save search results to database
   * @param {number} searchId - Search ID
   * @param {Array} results - Hotel results
   */
  async saveSearchResults(searchId, results) {
    try {
      for (const result of results) {
        await pool.query(
          `INSERT INTO ${HOTEL_RATES_TABLE} 
           (search_id, hotel_name, brand, parent_company, original_rate, discounted_rate, 
            discount_code, savings_amount, savings_percentage, booking_url, hotel_address, 
            amenities, rating, review_count) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
          [
            searchId,
            result.hotel_name || '',
            result.brand || '',
            result.parent_company || '',
            result.original_rate || null,
            result.discounted_rate || null,
            result.discount_code || null,
            result.savings_amount || null,
            result.savings_percentage || null,
            result.booking_url || '',
            result.hotel_address || '',
            JSON.stringify(result.amenities || []),
            result.rating || null,
            result.review_count || null
          ]
        );
      }
      
      console.log(`💾 Saved ${results.length} hotel results to database`);
    } catch (error) {
      console.error('Error saving search results:', error);
      // Don't throw - search can continue without saving
    }
  }

  /**
   * Find the best rate from all results
   * @param {Array} results - Hotel results
   * @returns {Object|null} Best rate result
   */
  findBestRate(results) {
    if (results.length === 0) return null;
    
    return results.reduce((best, current) => {
      const currentRate = current.discounted_rate || current.original_rate || Infinity;
      const bestRate = best.discounted_rate || best.original_rate || Infinity;
      
      return currentRate < bestRate ? current : best;
    });
  }

  /**
   * Calculate total savings across all results
   * @param {Array} results - Hotel results
   * @returns {number} Total savings amount
   */
  calculateTotalSavings(results) {
    return results.reduce((total, result) => {
      return total + (result.savings_amount || 0);
    }, 0);
  }

  /**
   * Get search history for a user
   * @param {string} userId - User ID
   * @param {number} limit - Number of searches to return
   * @returns {Promise<Array>} Search history
   */
  async getSearchHistory(userId, limit = 10) {
    try {
      const result = await pool.query(
        `SELECT * FROM ${HOTEL_SEARCHES_TABLE} 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT $2`,
        [userId, limit]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error fetching search history:', error);
      throw error;
    }
  }

  /**
   * Get results for a specific search
   * @param {number} searchId - Search ID
   * @returns {Promise<Array>} Search results
   */
  async getSearchResults(searchId) {
    try {
      const result = await pool.query(
        `SELECT * FROM ${HOTEL_RATES_TABLE} 
         WHERE search_id = $1 
         ORDER BY discounted_rate ASC`,
        [searchId]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error fetching search results:', error);
      throw error;
    }
  }
}

module.exports = new HotelSearchService();