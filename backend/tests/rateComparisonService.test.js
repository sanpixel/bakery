// Test file for Rate Comparison Service
const rateComparisonService = require('../services/rateComparisonService');

/**
 * Rate Comparison Service Tests
 */
async function runRateComparisonTests() {
  console.log('💰 Running Rate Comparison Service Tests...');
  
  // Mock hotel data for testing
  const mockResults = [
    {
      hotel_name: 'Hampton Inn NYC',
      brand: 'Hampton Inn',
      parent_company: 'hilton',
      original_rate: 200,
      discounted_rate: 170,
      savings_amount: 30,
      savings_percentage: 15,
      rating: 4.2
    },
    {
      hotel_name: 'Courtyard Manhattan',
      brand: 'Courtyard',
      parent_company: 'marriott',
      original_rate: 220,
      discounted_rate: 190,
      savings_amount: 30,
      savings_percentage: 13.6,
      rating: 4.4
    },
    {
      hotel_name: 'Hilton Garden Inn NYC',
      brand: 'Hilton Garden Inn',
      parent_company: 'hilton',
      original_rate: 180,
      discounted_rate: 150,
      savings_amount: 30,
      savings_percentage: 16.7,
      rating: 4.1
    }
  ];

  try {
    // Test 1: Find best rate
    console.log('Test 1: Find best rate');
    const bestRate = rateComparisonService.findBestRate(mockResults);
    
    if (!bestRate || bestRate.hotel_name !== 'Hilton Garden Inn NYC') {
      throw new Error('Should find Hilton Garden Inn as best rate ($150)');
    }
    
    console.log('✅ Best rate test passed');
    console.log(`   Best rate: ${bestRate.hotel_name} at $${bestRate.discounted_rate}`);
    
    // Test 2: Calculate savings
    console.log('Test 2: Calculate savings');
    const savings = rateComparisonService.calculateSavings(200, 170);
    
    if (savings.savings_amount !== 30 || savings.savings_percentage !== 15) {
      throw new Error('Savings calculation incorrect');
    }
    
    console.log('✅ Savings calculation test passed');
    
    // Test 3: Rank results by price
    console.log('Test 3: Rank results by price');
    const rankedByPrice = rateComparisonService.rankResults(mockResults, 'price', 'asc');
    
    if (rankedByPrice[0].hotel_name !== 'Hilton Garden Inn NYC') {
      throw new Error('Should rank Hilton Garden Inn first (cheapest)');
    }
    
    console.log('✅ Price ranking test passed');  
  
    // Test 4: Group by parent company
    console.log('Test 4: Group by parent company');
    const grouped = rateComparisonService.groupByParentCompany(mockResults);
    
    if (grouped.hilton.length !== 2 || grouped.marriott.length !== 1) {
      throw new Error('Grouping by parent company failed');
    }
    
    console.log('✅ Parent company grouping test passed');
    
    // Test 5: Calculate comparison stats
    console.log('Test 5: Calculate comparison stats');
    const stats = rateComparisonService.calculateComparisonStats(mockResults);
    
    if (stats.totalResults !== 3 || stats.totalSavings !== 90) {
      throw new Error('Comparison stats calculation failed');
    }
    
    console.log('✅ Comparison stats test passed');
    console.log(`   Total savings: $${stats.totalSavings}`);
    
    // Test 6: Find best deals
    console.log('Test 6: Find best deals');
    const bestDeals = rateComparisonService.findBestDeals(mockResults);
    
    if (!bestDeals.cheapest || !bestDeals.highestRated) {
      throw new Error('Best deals calculation failed');
    }
    
    console.log('✅ Best deals test passed');
    console.log(`   Cheapest: ${bestDeals.cheapest.hotel_name}`);
    console.log(`   Highest rated: ${bestDeals.highestRated.hotel_name}`);
    
    // Test 7: Compare two hotels
    console.log('Test 7: Compare two hotels');
    const comparison = rateComparisonService.compareHotels(mockResults[0], mockResults[1]);
    
    if (!comparison.cheaperHotel || !comparison.higherRatedHotel) {
      throw new Error('Hotel comparison failed');
    }
    
    console.log('✅ Hotel comparison test passed');
    
    console.log('🎉 All Rate Comparison Service tests passed!');
    
  } catch (error) {
    console.error('❌ Rate Comparison test failed:', error.message);
    throw error;
  }
}

// Export for use in other test files
module.exports = { runRateComparisonTests };

// Run tests if this file is executed directly
if (require.main === module) {
  runRateComparisonTests()
    .then(() => {
      console.log('Rate comparison tests completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Rate comparison tests failed:', error);
      process.exit(1);
    });
}