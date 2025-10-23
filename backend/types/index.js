// CodeWallet Data Models
// Since this is a JavaScript project, using JSDoc for type definitions

/**
 * @typedef {Object} DiscountCode
 * @property {number} id - Unique identifier
 * @property {string} user_id - UUID of the user who owns this code
 * @property {string} corporate_name - Name of the corporation (e.g., "GE", "IBM")
 * @property {string} code_value - The actual discount code value
 * @property {string} notes - Optional notes about the code
 * @property {Date} created_at - When the code was added
 * @property {Date} updated_at - When the code was last modified
 */

/**
 * @typedef {Object} HotelSearch
 * @property {number} id - Unique identifier
 * @property {string} user_id - UUID of the user who performed the search
 * @property {string} search_location - Location searched (city, address, etc.)
 * @property {Date} check_in_date - Check-in date
 * @property {Date} check_out_date - Check-out date
 * @property {number} guest_count - Number of guests
 * @property {string} codes_used - JSON string of discount codes used in search
 * @property {Date} created_at - When the search was performed
 */

/**
 * @typedef {Object} HotelRate
 * @property {number} id - Unique identifier
 * @property {number} search_id - Reference to the hotel search
 * @property {string} hotel_name - Name of the hotel
 * @property {string} brand - Hotel brand (e.g., "Hampton Inn")
 * @property {string} parent_company - Parent company ("hilton" or "marriott")
 * @property {number} original_rate - Original rate before discount
 * @property {number} discounted_rate - Rate after applying discount code
 * @property {string} discount_code - The discount code that was applied
 * @property {number} savings_amount - Dollar amount saved
 * @property {number} savings_percentage - Percentage saved
 * @property {string} booking_url - Direct link to book this rate
 * @property {string} hotel_address - Hotel address
 * @property {string} amenities - JSON string of hotel amenities
 * @property {number} rating - Hotel rating (1-5)
 * @property {number} review_count - Number of reviews
 * @property {Date} created_at - When this rate was recorded
 */

/**
 * @typedef {Object} HotelBrand
 * @property {number} id - Unique identifier
 * @property {string} parent_company - Parent company ("hilton" or "marriott")
 * @property {string} brand_name - Full brand name
 * @property {string} brand_code - Short brand code
 * @property {string} booking_url_template - URL template for booking
 * @property {boolean} is_active - Whether this brand is active
 */

/**
 * @typedef {Object} SearchRequest
 * @property {string} location - Search location
 * @property {string} checkIn - Check-in date (YYYY-MM-DD)
 * @property {string} checkOut - Check-out date (YYYY-MM-DD)
 * @property {number} guests - Number of guests
 * @property {string[]} discountCodes - Array of discount codes to try
 */

/**
 * @typedef {Object} SearchResult
 * @property {HotelRate[]} rates - Array of hotel rates found
 * @property {string} summary - AI-generated summary of results
 * @property {HotelRate} bestRate - The best rate found
 * @property {number} totalHotelsFound - Total number of hotels found
 */

module.exports = {
  // Export types for JSDoc reference
  // In a TypeScript project, these would be actual type exports
};