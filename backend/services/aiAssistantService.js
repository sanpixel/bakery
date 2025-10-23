const OpenAI = require('openai');
const fs = require('fs');

/**
 * AI Assistant Service for CodeWallet Hotel Rate Finder
 * Uses OpenAI to enhance user experience with natural language processing
 */
class AIAssistantService {
  constructor() {
    // Load OpenAI API key (same logic as main app)
    let OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      try {
        const config = JSON.parse(fs.readFileSync('C:\\dev\\openai-key.json', 'utf8'));
        OPENAI_API_KEY = config.OPENAI_API_KEY;
      } catch (error) {
        console.log('OpenAI key not found in aiAssistantService');
      }
    }
    
    this.openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;
  }

  /**
   * Parse natural language search input into structured search parameters
   * @param {string} userInput - Natural language input like "cheap hotel in NYC next weekend"
   * @returns {Promise<Object>} Structured search parameters
   */
  async parseNaturalLanguageSearch(userInput) {
    if (!this.openai) {
      throw new Error('OpenAI not configured');
    }

    try {
      const systemPrompt = `You are a hotel search assistant. Parse the user's natural language input into structured search parameters.

Return a JSON object with these fields:
- location: string (city, neighborhood, or address)
- checkIn: string (YYYY-MM-DD format, or null if not specified)
- checkOut: string (YYYY-MM-DD format, or null if not specified)
- guests: number (default 1)
- priceRange: string ("budget", "mid-range", "luxury", or null)
- notes: string (any additional preferences or context)

Examples:
"cheap hotel in NYC next weekend" -> {"location": "New York City", "checkIn": null, "checkOut": null, "guests": 1, "priceRange": "budget", "notes": "next weekend"}
"2 people in Chicago March 15-17" -> {"location": "Chicago", "checkIn": "2024-03-15", "checkOut": "2024-03-17", "guests": 2, "priceRange": null, "notes": null}

Only return valid JSON, no other text.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userInput }
        ],
        max_tokens: 200,
        temperature: 0.3
      });

      const response = completion.choices[0].message.content.trim();
      
      try {
        return JSON.parse(response);
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', response);
        // Fallback: return basic structure with original input
        return {
          location: userInput,
          checkIn: null,
          checkOut: null,
          guests: 1,
          priceRange: null,
          notes: 'Could not parse automatically'
        };
      }
    } catch (error) {
      console.error('Error in parseNaturalLanguageSearch:', error);
      throw error;
    }
  }

  /**
   * Extract hotel data from scraped HTML into clean JSON
   * @param {string} scrapedHTML - Raw HTML from hotel booking pages
   * @param {string} hotelBrand - Brand context (hilton, marriott, etc.)
   * @returns {Promise<Object>} Clean hotel data
   */
  async extractHotelData(scrapedHTML, hotelBrand = '') {
    if (!this.openai) {
      throw new Error('OpenAI not configured');
    }

    try {
      const systemPrompt = `You are a data extraction assistant. Extract hotel information from the provided HTML.

Return a JSON object with these fields:
- hotelName: string
- brand: string (hotel brand like "Hampton Inn", "Courtyard")
- address: string
- originalRate: number (price per night before discounts)
- discountedRate: number (price after discount, or same as original if no discount)
- amenities: array of strings
- rating: number (1-5 scale)
- reviewCount: number

If you cannot find a field, use null. For prices, extract only the numeric value.
Only return valid JSON, no other text.

Brand context: ${hotelBrand}`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Extract hotel data from this HTML:\n\n${scrapedHTML.substring(0, 4000)}` }
        ],
        max_tokens: 300,
        temperature: 0.1
      });

      const response = completion.choices[0].message.content.trim();
      
      try {
        return JSON.parse(response);
      } catch (parseError) {
        console.error('Failed to parse hotel data extraction:', response);
        return {
          hotelName: null,
          brand: hotelBrand,
          address: null,
          originalRate: null,
          discountedRate: null,
          amenities: [],
          rating: null,
          reviewCount: null
        };
      }
    } catch (error) {
      console.error('Error in extractHotelData:', error);
      throw error;
    }
  }

  /**
   * Summarize search results in plain English
   * @param {Array} searchResults - Array of hotel rate results
   * @param {Array} discountCodes - Discount codes that were used
   * @returns {Promise<Object>} Summary and recommendations
   */
  async summarizeResults(searchResults, discountCodes = []) {
    if (!this.openai) {
      throw new Error('OpenAI not configured');
    }

    try {
      const systemPrompt = `You are a hotel booking assistant. Analyze the search results and provide a helpful summary.

Return a JSON object with:
- summary: string (2-3 sentence overview of the results)
- bestDeal: string (highlight the best deal found)
- savings: string (explain savings from discount codes)
- recommendations: array of strings (2-3 actionable recommendations)

Be conversational and helpful. Focus on value and practical advice.
Only return valid JSON.`;

      const resultsText = searchResults.map(result => 
        `${result.hotelName || 'Hotel'} (${result.brand || 'Unknown'}): $${result.discountedRate || result.originalRate || 'N/A'} with ${result.discountCode || 'no code'}`
      ).join('\n');

      const codesText = discountCodes.length > 0 ? `Codes used: ${discountCodes.join(', ')}` : 'No discount codes used';

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Search Results:\n${resultsText}\n\n${codesText}` }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      const response = completion.choices[0].message.content.trim();
      
      try {
        return JSON.parse(response);
      } catch (parseError) {
        console.error('Failed to parse results summary:', response);
        return {
          summary: `Found ${searchResults.length} hotel options with various rates.`,
          bestDeal: searchResults.length > 0 ? `${searchResults[0].hotelName} appears to be a good option.` : 'No deals found.',
          savings: discountCodes.length > 0 ? `Tried ${discountCodes.length} discount codes.` : 'No discount codes applied.',
          recommendations: ['Compare rates across different dates', 'Check for additional fees', 'Read recent reviews']
        };
      }
    } catch (error) {
      console.error('Error in summarizeResults:', error);
      throw error;
    }
  }

  /**
   * Generate search suggestions for location and dates
   * @param {string} location - Current location input
   * @param {string} dates - Current date input
   * @returns {Promise<Object>} Suggestions for better search terms
   */
  async generateSearchSuggestions(location, dates) {
    if (!this.openai) {
      throw new Error('OpenAI not configured');
    }

    try {
      const systemPrompt = `You are a travel assistant. Given a location and dates, suggest improvements or alternatives.

Return a JSON object with:
- locationSuggestions: array of strings (alternative locations, nearby areas)
- dateSuggestions: array of strings (alternative date ranges, better timing)
- tips: array of strings (helpful travel tips for this location/time)

Keep suggestions practical and helpful. Only return valid JSON.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Location: ${location}, Dates: ${dates}` }
        ],
        max_tokens: 250,
        temperature: 0.5
      });

      const response = completion.choices[0].message.content.trim();
      
      try {
        return JSON.parse(response);
      } catch (parseError) {
        console.error('Failed to parse suggestions:', response);
        return {
          locationSuggestions: [],
          dateSuggestions: [],
          tips: []
        };
      }
    } catch (error) {
      console.error('Error in generateSearchSuggestions:', error);
      throw error;
    }
  }
}

module.exports = new AIAssistantService();