/**
 * Rate Comparison Service
 * Handles rate comparison, ranking, and savings calculations
 */
class RateComparisonService {
  
  /**
   * Find the best rate from search results
   * @param {Array} searchResults - Array of hotel rate results
   * @returns {Object|null} Best rate result
   */
  findBestRate(searchResults) {
    if (!searchResults || searchResults.length === 0) {
      return null;
    }
    
    return searchResults.reduce((best, current) => {
      const currentRate = this.getEffectiveRate(current);
      const bestRate = this.getEffectiveRate(best);
      
      return currentRate < bestRate ? current : best;
    });
  }

  /**
   * Get effective rate (discounted if available, otherwise original)
   * @param {Object} result - Hotel result
   * @returns {number} Effective rate
   */
  getEffectiveRate(result) {
    return result.discounted_rate || result.original_rate || Infinity;
  }

  /**
   * Calculate savings for a hotel result
   * @param {number} originalRate - Original rate
   * @param {number} discountedRate - Discounted rate
   * @returns {Object} Savings calculation
   */
  calculateSavings(originalRate, discountedRate) {
    if (!originalRate || !discountedRate || originalRate <= discountedRate) {
      return {
        savings_amount: 0,
        savings_percentage: 0
      };
    }
    
    const savingsAmount = originalRate - discountedRate;
    const savingsPercentage = (savingsAmount / originalRate) * 100;
    
    return {
      savings_amount: Math.round(savingsAmount * 100) / 100,
      savings_percentage: Math.round(savingsPercentage * 100) / 100
    };
  }

  /**
   * Rank results by various criteria
   * @param {Array} results - Hotel results
   * @param {string} sortBy - Sort criteria ('price', 'savings', 'rating', 'brand')
   * @param {string} order - Sort order ('asc', 'desc')
   * @returns {Array} Sorted results
   */
  rankResults(results, sortBy = 'price', order = 'asc') {
    if (!results || results.length === 0) {
      return [];
    }
    
    const sortedResults = [...results].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'price':
          aValue = this.getEffectiveRate(a);
          bValue = this.getEffectiveRate(b);
          break;
          
        case 'savings':
          aValue = a.savings_amount || 0;
          bValue = b.savings_amount || 0;
          break;
          
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
          
        case 'brand':
          aValue = a.brand || '';
          bValue = b.brand || '';
          break;
          
        default:
          aValue = this.getEffectiveRate(a);
          bValue = this.getEffectiveRate(b);
      }
      
      if (order === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });
    
    return sortedResults;
  }

  /**
   * Group results by parent company (Hilton vs Marriott)
   * @param {Array} results - Hotel results
   * @returns {Object} Grouped results
   */
  groupByParentCompany(results) {
    if (!results || results.length === 0) {
      return { hilton: [], marriott: [], other: [] };
    }
    
    const grouped = {
      hilton: [],
      marriott: [],
      other: []
    };
    
    results.forEach(result => {
      const parentCompany = (result.parent_company || '').toLowerCase();
      
      if (parentCompany === 'hilton') {
        grouped.hilton.push(result);
      } else if (parentCompany === 'marriott') {
        grouped.marriott.push(result);
      } else {
        grouped.other.push(result);
      }
    });
    
    return grouped;
  }

  /**
   * Group results by brand
   * @param {Array} results - Hotel results
   * @returns {Object} Results grouped by brand
   */
  groupByBrand(results) {
    if (!results || results.length === 0) {
      return {};
    }
    
    const grouped = {};
    
    results.forEach(result => {
      const brand = result.brand || 'Unknown';
      
      if (!grouped[brand]) {
        grouped[brand] = [];
      }
      
      grouped[brand].push(result);
    });
    
    return grouped;
  }

  /**
   * Calculate comparison statistics
   * @param {Array} results - Hotel results
   * @returns {Object} Comparison statistics
   */
  calculateComparisonStats(results) {
    if (!results || results.length === 0) {
      return {
        totalResults: 0,
        averageRate: 0,
        totalSavings: 0,
        bestSavingsPercentage: 0,
        priceRange: { min: 0, max: 0 }
      };
    }
    
    const rates = results.map(r => this.getEffectiveRate(r)).filter(r => r !== Infinity);
    const savings = results.map(r => r.savings_amount || 0);
    const savingsPercentages = results.map(r => r.savings_percentage || 0);
    
    return {
      totalResults: results.length,
      averageRate: rates.length > 0 ? Math.round((rates.reduce((sum, rate) => sum + rate, 0) / rates.length) * 100) / 100 : 0,
      totalSavings: Math.round(savings.reduce((sum, saving) => sum + saving, 0) * 100) / 100,
      bestSavingsPercentage: Math.max(...savingsPercentages, 0),
      priceRange: {
        min: rates.length > 0 ? Math.min(...rates) : 0,
        max: rates.length > 0 ? Math.max(...rates) : 0
      }
    };
  }

  /**
   * Find best deals by different criteria
   * @param {Array} results - Hotel results
   * @returns {Object} Best deals summary
   */
  findBestDeals(results) {
    if (!results || results.length === 0) {
      return {
        cheapest: null,
        bestSavings: null,
        highestRated: null,
        bestValue: null
      };
    }
    
    const cheapest = this.findBestRate(results);
    
    const bestSavings = results.reduce((best, current) => {
      const currentSavings = current.savings_amount || 0;
      const bestSavingsAmount = best.savings_amount || 0;
      return currentSavings > bestSavingsAmount ? current : best;
    });
    
    const highestRated = results.reduce((best, current) => {
      const currentRating = current.rating || 0;
      const bestRating = best.rating || 0;
      return currentRating > bestRating ? current : best;
    });
    
    // Best value: combination of low price and high rating
    const bestValue = results.reduce((best, current) => {
      const currentScore = this.calculateValueScore(current);
      const bestScore = this.calculateValueScore(best);
      return currentScore > bestScore ? current : best;
    });
    
    return {
      cheapest,
      bestSavings: bestSavings.savings_amount > 0 ? bestSavings : null,
      highestRated: highestRated.rating > 0 ? highestRated : null,
      bestValue
    };
  }

  /**
   * Calculate value score (combination of price and rating)
   * @param {Object} result - Hotel result
   * @returns {number} Value score (higher is better)
   */
  calculateValueScore(result) {
    const rate = this.getEffectiveRate(result);
    const rating = result.rating || 0;
    
    if (rate === Infinity || rating === 0) {
      return 0;
    }
    
    // Normalize rate (lower is better) and rating (higher is better)
    // This is a simple scoring algorithm - could be made more sophisticated
    const priceScore = Math.max(0, (500 - rate) / 500); // Assuming max reasonable rate is $500
    const ratingScore = rating / 5; // Rating out of 5
    
    return (priceScore * 0.6) + (ratingScore * 0.4); // Weight price more heavily
  }

  /**
   * Compare two specific hotels
   * @param {Object} hotel1 - First hotel
   * @param {Object} hotel2 - Second hotel
   * @returns {Object} Comparison result
   */
  compareHotels(hotel1, hotel2) {
    const rate1 = this.getEffectiveRate(hotel1);
    const rate2 = this.getEffectiveRate(hotel2);
    
    const comparison = {
      hotel1: hotel1,
      hotel2: hotel2,
      priceDifference: Math.abs(rate1 - rate2),
      cheaperHotel: rate1 < rate2 ? hotel1 : hotel2,
      ratingDifference: Math.abs((hotel1.rating || 0) - (hotel2.rating || 0)),
      higherRatedHotel: (hotel1.rating || 0) > (hotel2.rating || 0) ? hotel1 : hotel2,
      savingsDifference: Math.abs((hotel1.savings_amount || 0) - (hotel2.savings_amount || 0)),
      betterSavingsHotel: (hotel1.savings_amount || 0) > (hotel2.savings_amount || 0) ? hotel1 : hotel2
    };
    
    return comparison;
  }
}

module.exports = new RateComparisonService();