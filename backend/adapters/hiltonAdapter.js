const aiAssistantService = require('../services/aiAssistantService');

/**
 * Hilton Hotel Adapter
 * Handles searches across Hilton brand properties
 */
class HiltonAdapter {
  constructor() {
    this.brands = [
      'Hilton Hotels & Resorts',
      'Conrad Hotels & Resorts', 
      'Waldorf Astoria Hotels & Resorts',
      'Hampton by Hilton',
      'Hilton Garden Inn',
      'Homewood Suites by Hilton',
      'DoubleTree by Hilton',
      'Embassy Suites by Hilton',
      'Curio Collection by Hilton',
      'Home2 Suites by Hilton'
    ];
  }

  /**
   * Search Hilton properties
   * @param {Object} searchParams - Search parameters
   * @param {Array} discountCodes - Discount codes to try
   * @returns {Promise<Array>} Array of hotel results
   */
  async searchHotels(searchParams, discountCodes = []) {
    try {
      console.log('🏨 Searching Hilton properties...');
      
      // For now, return mock data
      // In production, this would call Hilton's API or scrape their website
      const mockResults = await this.getMockHiltonResults(searchParams, discountCodes);
      
      return mockResults;
      
    } catch (error) {
      console.error('Error in Hilton adapter:', error);
      throw error;
    }
  }

  /**
   * Generate mock Hilton results for testing
   * @param {Object} searchParams - Search parameters
   * @param {Array} discountCodes - Discount codes
   * @returns {Promise<Array>} Mock results
   */
  async getMockHiltonResults(searchParams, discountCodes) {
    const location = searchParams.location || 'Unknown Location';
    
    const mockHotels = [
      {
        hotel_name: `Hampton Inn & Suites ${location}`,
        brand: 'Hampton by Hilton',
        hotel_address: `123 Main St, ${location}`,
        original_rate: 189.99,
        rating: 4.2,
        review_count: 1234,
        amenities: ['Free WiFi', 'Free Breakfast', 'Fitness Center', 'Pool']
      },
      {
        hotel_name: `Hilton Garden Inn ${location}`,
        brand: 'Hilton Garden Inn', 
        hotel_address: `456 Business Blvd, ${location}`,
        original_rate: 219.99,
        rating: 4.4,
        review_count: 892,
        amenities: ['Free WiFi', 'Restaurant', 'Fitness Center', 'Business Center']
      },
      {
        hotel_name: `DoubleTree by Hilton ${location}`,
        brand: 'DoubleTree by Hilton',
        hotel_address: `789 Downtown Ave, ${location}`,
        original_rate: 249.99,
        rating: 4.3,
        review_count: 1567,
        amenities: ['Free WiFi', 'Restaurant', 'Pool', 'Spa', 'Parking']
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

    console.log(`✅ Generated ${resultsWithDiscounts.length} Hilton mock results`);
    return resultsWithDiscounts;
  }

  /**
   * Apply discount code to hotel rate
   * @param {Object} hotel - Hotel data
   * @param {string} code - Discount code
   * @returns {Object|null} Result with discount applied, or null if code doesn't work
   */
  applyDiscountCode(hotel, code) {
    // Mock discount logic - in reality this would test the code with Hilton's system
    const discountRules = {
      // Corporate codes with different discount rates
      '0001398': 0.15,      // GE - 15% off
      '0322831100': 0.12,   // Pfizer - 12% off  
      '323009803': 0.10,    // Siemens - 10% off
      '0901452': 0.18,      // IBM - 18% off
      '001368083': 0.18,    // IBM alternate - 18% off
      'n0901452': 0.18,     // IBM with prefix - 18% off
      '009122532': 0.14,    // HP - 14% off
      '355019365': 0.13,    // Volvo - 13% off
      '0560041604': 0.20,   // MVP - 20% off
      'N0001231': 0.10,     // FedEx - 10% off (system wide)
      'N9880578': 0.22,     // Blackstone - 22% off (Hilton, Conrad, Waldorf, HGI)
      '0560054725': 0.18,   // Blackstone Homewood - 18% off
      'D332376164': 0.16    // Blackstone DT/Hilton - 16% off
    };

    const discountRate = discountRules[code];
    if (!discountRate) {
      return null; // Code doesn't work for this hotel
    }

    // Check brand restrictions for Blackstone codes
    if (code === 'N9880578') {
      const allowedBrands = ['Hilton Hotels & Resorts', 'Conrad Hotels & Resorts', 'Waldorf Astoria Hotels & Resorts', 'Hilton Garden Inn'];
      if (!allowedBrands.includes(hotel.brand)) {
        return null;
      }
    }
    
    if (code === '0560054725') {
      if (hotel.brand !== 'Homewood Suites by Hilton') {
        return null;
      }
    }
    
    if (code === 'D332376164') {
      const allowedBrands = ['DoubleTree by Hilton', 'Hilton Hotels & Resorts'];
      if (!allowedBrands.includes(hotel.brand)) {
        return null;
      }
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
    const baseUrl = 'https://www.hilton.com/en/book/reservation/rooms/';
    const params = new URLSearchParams({
      hotel: hotel.hotel_name.replace(/\s+/g, '-').toLowerCase(),
      ...(code && { corporateCode: code })
    });
    
    return `${baseUrl}?${params.toString()}`;
  }
}

module.exports = HiltonAdapter;