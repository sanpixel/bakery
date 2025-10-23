const aiAssistantService = require('../services/aiAssistantService');

/**
 * Marriott Hotel Adapter
 * Handles searches across Marriott brand properties
 */
class MarriottAdapter {
  constructor() {
    this.brands = [
      'Marriott Hotels',
      'The Ritz-Carlton',
      'W Hotels',
      'Sheraton Hotels & Resorts',
      'Westin Hotels & Resorts',
      'Courtyard by Marriott',
      'Residence Inn by Marriott',
      'Fairfield Inn & Suites',
      'SpringHill Suites',
      'TownePlace Suites',
      'AC Hotels by Marriott',
      'Aloft Hotels'
    ];
  }

  /**
   * Search Marriott properties
   * @param {Object} searchParams - Search parameters
   * @param {Array} discountCodes - Discount codes to try
   * @returns {Promise<Array>} Array of hotel results
   */
  async searchHotels(searchParams, discountCodes = []) {
    try {
      console.log('🏨 Searching Marriott properties...');
      
      // For now, return mock data
      // In production, this would call Marriott's API or scrape their website
      const mockResults = await this.getMockMarriottResults(searchParams, discountCodes);
      
      return mockResults;
      
    } catch (error) {
      console.error('Error in Marriott adapter:', error);
      throw error;
    }
  }

  /**
   * Generate mock Marriott results for testing
   * @param {Object} searchParams - Search parameters
   * @param {Array} discountCodes - Discount codes
   * @returns {Promise<Array>} Mock results
   */
  async getMockMarriottResults(searchParams, discountCodes) {
    const location = searchParams.location || 'Unknown Location';
    
    const mockHotels = [
      {
        hotel_name: `Courtyard by Marriott ${location}`,
        brand: 'Courtyard by Marriott',
        hotel_address: `321 Corporate Dr, ${location}`,
        original_rate: 199.99,
        rating: 4.3,
        review_count: 987,
        amenities: ['Free WiFi', 'Restaurant', 'Fitness Center', 'Business Center']
      },
      {
        hotel_name: `Residence Inn by Marriott ${location}`,
        brand: 'Residence Inn by Marriott', 
        hotel_address: `654 Extended Stay Ln, ${location}`,
        original_rate: 229.99,
        rating: 4.5,
        review_count: 756,
        amenities: ['Free WiFi', 'Free Breakfast', 'Kitchen', 'Pool', 'Pet Friendly']
      },
      {
        hotel_name: `Marriott ${location}`,
        brand: 'Marriott Hotels',
        hotel_address: `987 Luxury Blvd, ${location}`,
        original_rate: 289.99,
        rating: 4.6,
        review_count: 2134,
        amenities: ['Free WiFi', 'Restaurant', 'Spa', 'Pool', 'Concierge', 'Valet Parking']
      },
      {
        hotel_name: `Fairfield Inn & Suites ${location}`,
        brand: 'Fairfield Inn & Suites',
        hotel_address: `147 Budget Way, ${location}`,
        original_rate: 159.99,
        rating: 4.1,
        review_count: 543,
        amenities: ['Free WiFi', 'Free Breakfast', 'Pool', 'Fitness Center']
      }
    ];

    // Apply discount codes
    const resultsWithDiscounts = [];
    
    for (const hotel of mockHotels) {
      // Try each discount code
      for (const code of discountCodes) {
        const discountResult = this.applyDiscountCode(hotel, code);
        if (discountResult) {
          resultsWithDiscounts.push(discountResult);
        }
      }
      
      // Also include original rate without discount
      resultsWithDiscounts.push({
        ...hotel,
        discounted_rate: hotel.original_rate,
        discount_code: null,
        savings_amount: 0,
        savings_percentage: 0,
        booking_url: this.generateBookingUrl(hotel, null)
      });
    }

    console.log(`✅ Generated ${resultsWithDiscounts.length} Marriott mock results`);
    return resultsWithDiscounts;
  }

  /**
   * Apply discount code to hotel rate
   * @param {Object} hotel - Hotel data
   * @param {string} code - Discount code
   * @returns {Object|null} Result with discount applied, or null if code doesn't work
   */
  applyDiscountCode(hotel, code) {
    // Mock discount logic for Marriott
    // Note: Some codes work better with Marriott, some with Hilton
    const discountRules = {
      // Corporate codes - Marriott typically has different rates than Hilton
      '0001398': 0.12,      // GE - 12% off (slightly less than Hilton)
      '0322831100': 0.14,   // Pfizer - 14% off (better than Hilton)
      '323009803': 0.11,    // Siemens - 11% off
      '402371223': 0.13,    // Akzo Nobel - 13% off (Marriott specific)
      '0901452': 0.16,      // IBM - 16% off
      '001368083': 0.16,    // IBM alternate - 16% off
      'n0901452': 0.16,     // IBM with prefix - 16% off
      '009122532': 0.12,    // HP - 12% off
      '355019365': 0.15,    // Volvo - 15% off (better at Marriott)
      'N0001231': 0.10,     // FedEx - 10% off (system wide)
      // Note: Blackstone codes typically don't work with Marriott
    };

    const discountRate = discountRules[code];
    if (!discountRate) {
      return null; // Code doesn't work for this hotel
    }

    const discountedRate = hotel.original_rate * (1 - discountRate);
    const savingsAmount = hotel.original_rate - discountedRate;
    const savingsPercentage = discountRate * 100;

    return {
      ...hotel,
      discounted_rate: Math.round(discountedRate * 100) / 100,
      discount_code: code,
      savings_amount: Math.round(savingsAmount * 100) / 100,
      savings_percentage: Math.round(savingsPercentage * 100) / 100,
      booking_url: this.generateBookingUrl(hotel, code)
    };
  }

  /**
   * Generate booking URL for hotel
   * @param {Object} hotel - Hotel data
   * @param {string} code - Discount code (optional)
   * @returns {string} Booking URL
   */
  generateBookingUrl(hotel, code) {
    const baseUrl = 'https://www.marriott.com/reservation/rateListMenu.mi';
    const params = new URLSearchParams({
      hotel: hotel.hotel_name.replace(/\s+/g, '-').toLowerCase(),
      ...(code && { corporateCode: code })
    });
    
    return `${baseUrl}?${params.toString()}`;
  }
}

module.exports = MarriottAdapter;