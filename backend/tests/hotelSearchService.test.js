// Test file for Hotel Search Service
const hotelSearchService = require('../services/hotelSearchService');
const HiltonAdapter = require('../adapters/hiltonAdapter');
const MarriottAdapter = require('../adapters/marriottAdapter');
const discountCodeService = require('../services/discountCodeService');

/**
 * Hotel Search Service Tests
 */
async function runHotelSearchTests() {
  console.log('🏨 Running Hotel Search Service Tests...');
  
  const testUserId = 'test-hotel-user-' + Date.now();
  
  try {
    // Setup: Register adapters
    hotelSearchService.registerAdapter('hilton', new HiltonAdapter());
    hotelSearchService.registerAdapter('marriott', new MarriottAdapter());
    
    // Setup: Add test discount codes
    await discountCodeService.saveUserCode(testUserId, 'GE', '0001398', 'Test GE code');
    await discountCodeService.saveUserCode(testUserId, 'IBM', '0901452', 'Test IBM code');
    
    // Test 1: Basic hotel search
    console.log('Test 1: Basic hotel search');
    const searchParams = {
      location: 'New York City',
      checkIn: '2024-03-15',
      checkOut: '2024-03-17',
      guests: 2
    };
    
    const searchResults = await hotelSearchService.searchHotels(searchParams, testUserId);
    
    if (!searchResults || !Array.isArray(searchResults.results)) {
      throw new Error('Search results should be an array');
    }
    
    if (searchResults.results.length === 0) {
      throw new Error('Should find at least some hotel results');
    }
    
    console.log('✅ Basic search test passed');
    console.log(`   Found ${searchResults.results.length} results`);
    
    // Test 2: Natural language search
    console.log('Test 2: Natural language search');
    const nlSearchParams = {
      naturalLanguageQuery: 'cheap hotel in Chicago for 2 people'
    };
    
    const nlResults = await hotelSearchService.searchHotels(nlSearchParams, testUserId);
    
    if (!nlResults || !nlResults.aiSummary) {
      throw new Error('Natural language search should include AI summary');
    }
    
    console.log('✅ Natural language search test passed');
    console.log(`   AI Summary: ${nlResults.aiSummary.summary}`);
    
    // Test 3: Best rate calculation
    console.log('Test 3: Best rate calculation');
    const mockResults = [
      { hotel_name: 'Hotel A', discounted_rate: 150 },
      { hotel_name: 'Hotel B', discounted_rate: 120 },
      { hotel_name: 'Hotel C', discounted_rate: 180 }
    ];
    
    const bestRate = hotelSearchService.findBestRate(mockResults);
    
    if (!bestRate || bestRate.hotel_name !== 'Hotel B') {
      throw new Error('Should find Hotel B as best rate');
    }
    
    console.log('✅ Best rate calculation test passed');
    
    // Test 4: Savings calculation
    console.log('Test 4: Savings calculation');
    const mockSavingsResults = [
      { savings_amount: 20 },
      { savings_amount: 15 },
      { savings_amount: 30 }
    ];
    
    const totalSavings = hotelSearchService.calculateTotalSavings(mockSavingsResults);
    
    if (totalSavings !== 65) {
      throw new Error(`Expected total savings of 65, got ${totalSavings}`);
    }
    
    console.log('✅ Savings calculation test passed');
    
    // Test 5: Search history
    console.log('Test 5: Search history');
    const history = await hotelSearchService.getSearchHistory(testUserId, 5);
    
    if (!Array.isArray(history)) {
      throw new Error('Search history should be an array');
    }
    
    if (history.length < 2) {
      throw new Error('Should have at least 2 searches in history');
    }
    
    console.log('✅ Search history test passed');
    console.log(`   Found ${history.length} searches in history`);
    
    // Test 6: Get search results by ID
    console.log('Test 6: Get search results by ID');
    const searchId = history[0].id;
    const savedResults = await hotelSearchService.getSearchResults(searchId);
    
    if (!Array.isArray(savedResults)) {
      throw new Error('Saved results should be an array');
    }
    
    console.log('✅ Get search results test passed');
    console.log(`   Retrieved ${savedResults.length} saved results`);
    
    console.log('🎉 All Hotel Search Service tests passed!');
    
    // Cleanup
    const userCodes = await discountCodeService.getUserCodes(testUserId);
    for (const code of userCodes) {
      await discountCodeService.deleteUserCode(testUserId, code.id);
    }
    console.log('🧹 Cleanup completed');
    
  } catch (error) {
    console.error('❌ Hotel Search test failed:', error.message);
    
    // Cleanup on error
    try {
      const userCodes = await discountCodeService.getUserCodes(testUserId);
      for (const code of userCodes) {
        await discountCodeService.deleteUserCode(testUserId, code.id);
      }
      console.log('🧹 Error cleanup completed');
    } catch (cleanupError) {
      console.log('⚠️ Cleanup failed:', cleanupError.message);
    }
    
    throw error;
  }
}

// Export for use in other test files
module.exports = { runHotelSearchTests };

// Run tests if this file is executed directly
if (require.main === module) {
  runHotelSearchTests()
    .then(() => {
      console.log('Hotel search tests completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Hotel search tests failed:', error);
      process.exit(1);
    });
}