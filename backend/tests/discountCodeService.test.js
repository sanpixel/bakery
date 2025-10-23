// Simple test file for discount code service
// Since this is a JavaScript project, using basic assertions

const discountCodeService = require('../services/discountCodeService');

/**
 * Basic test runner
 */
async function runTests() {
  console.log('🧪 Running Discount Code Service Tests...');
  
  const testUserId = 'test-user-' + Date.now();
  let testCodeId = null;
  
  try {
    // Test 1: Save a new discount code
    console.log('Test 1: Save new discount code');
    const newCode = await discountCodeService.saveUserCode(
      testUserId, 
      'GE', 
      '0001398', 
      'Test GE code'
    );
    
    if (!newCode || !newCode.id) {
      throw new Error('Failed to save discount code');
    }
    testCodeId = newCode.id;
    console.log('✅ Save test passed');
    
    // Test 2: Get user codes
    console.log('Test 2: Get user codes');
    const userCodes = await discountCodeService.getUserCodes(testUserId);
    
    if (!Array.isArray(userCodes) || userCodes.length !== 1) {
      throw new Error('Failed to retrieve user codes');
    }
    console.log('✅ Get codes test passed');
    
    // Test 3: Update code notes
    console.log('Test 3: Update code notes');
    const updatedCode = await discountCodeService.updateCodeNotes(
      testUserId, 
      testCodeId, 
      'Updated test notes'
    );
    
    if (!updatedCode || updatedCode.notes !== 'Updated test notes') {
      throw new Error('Failed to update code notes');
    }
    console.log('✅ Update notes test passed');
    
    // Test 4: Get codes by corporate name
    console.log('Test 4: Get codes by corporate name');
    const geCodes = await discountCodeService.getCodesByCorporate(testUserId, 'GE');
    
    if (!Array.isArray(geCodes) || geCodes.length !== 1) {
      throw new Error('Failed to get codes by corporate name');
    }
    console.log('✅ Get by corporate test passed');
    
    // Test 5: Delete code
    console.log('Test 5: Delete discount code');
    const deletedCode = await discountCodeService.deleteUserCode(testUserId, testCodeId);
    
    if (!deletedCode || deletedCode.id !== testCodeId) {
      throw new Error('Failed to delete discount code');
    }
    console.log('✅ Delete test passed');
    
    // Test 6: Verify deletion
    console.log('Test 6: Verify code was deleted');
    const codesAfterDelete = await discountCodeService.getUserCodes(testUserId);
    
    if (codesAfterDelete.length !== 0) {
      throw new Error('Code was not properly deleted');
    }
    console.log('✅ Deletion verification passed');
    
    console.log('🎉 All discount code service tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Cleanup: try to delete test code if it exists
    if (testCodeId) {
      try {
        await discountCodeService.deleteUserCode(testUserId, testCodeId);
        console.log('🧹 Cleanup completed');
      } catch (cleanupError) {
        console.log('⚠️ Cleanup failed:', cleanupError.message);
      }
    }
    
    throw error;
  }
}

// Export for use in other test files
module.exports = { runTests };

// Run tests if this file is executed directly
if (require.main === module) {
  runTests()
    .then(() => {
      console.log('Tests completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Tests failed:', error);
      process.exit(1);
    });
}