# Hotel Rate Finder Design Document

## Overview

The Hotel Rate Finder system will integrate with the existing bakery TODO application to provide hotel rate comparison functionality. The system will search Hilton and Marriott properties, apply corporate discount codes, and present the best available rates to authenticated users.

## Architecture

### High-Level Architecture
```
Frontend (React) ↔ Backend API (Express) ↔ Hotel Data Sources
                                        ↔ PostgreSQL Database
                                        ↔ Cache Layer (Redis/Memory)
```

### Integration with Existing System
- Extends the current Express.js backend with new hotel search endpoints
- Reuses existing Supabase authentication system
- Adds new database tables to the existing PostgreSQL setup
- Maintains the existing React frontend structure with new components

## Components and Interfaces

### Backend Components

#### 1. Hotel Search Service (`/backend/services/hotelSearchService.js`)
- **Purpose**: Orchestrates searches across multiple hotel data sources
- **Key Methods**:
  - `searchHotels(city, checkIn, checkOut, discountCodes)`
  - `applyDiscountCodes(hotelResults, codes)`
  - `compareRates(results)`

#### 2. Hotel Data Adapters
- **Hilton Adapter** (`/backend/adapters/hiltonAdapter.js`)
- **Marriott Adapter** (`/backend/adapters/marriottAdapter.js`)
- **Purpose**: Handle brand-specific API calls or web scraping
- **Interface**:
  ```javascript
  {
    searchAvailability(location, dates, guestCount),
    applyDiscountCode(hotelId, code),
    getHotelDetails(hotelId)
  }
  ```

#### 3. Discount Code Manager (`/backend/services/discountCodeService.js`)
- **Purpose**: Store and retrieve user's discount codes exactly as provided
- **Key Methods**:
  - `getUserCodes(userId)`
  - `saveUserCode(userId, code, corporateName)`
  - `deleteUserCode(userId, codeId)`

#### 4. Rate Comparison Engine (`/backend/services/rateComparisonService.js`)
- **Purpose**: Compare rates across brands and identify best deals
- **Key Methods**:
  - `findBestRate(searchResults)`
  - `calculateSavings(originalRate, discountedRate)`
  - `rankResults(results)`

#### 5. AI Assistant Service (`/backend/services/aiAssistantService.js`)
- **Purpose**: Use OpenAI to enhance user experience and data processing
- **Key Methods**:
  - `parseNaturalLanguageSearch(userInput)` - Convert "cheap hotel in NYC next week" to structured search
  - `extractHotelData(scrapedHTML)` - Parse messy hotel website data into clean JSON
  - `generateSearchSuggestions(location, dates)` - Suggest better search terms or nearby cities
  - `summarizeResults(searchResults)` - Create plain English summary of best deals found

### Frontend Components

#### UI Framework: Mantine CSS with Newspaper Layout
- **Design Theme**: Clean, newspaper-style layout with clear typography
- **Component Library**: Mantine UI components for consistent styling
- **Layout**: Multi-column grid layout resembling newspaper sections

#### 1. Hotel Search Form (`/frontend/src/components/HotelSearchForm.js`)
- Mantine TextInput for location with autocomplete
- Mantine DatePicker for date range selection
- Mantine MultiSelect for discount code selection
- **AI Natural Language Input**: "Find me a cheap hotel in NYC for next weekend"
- Newspaper-style header section

#### 2. Rate Comparison Display (`/frontend/src/components/RateComparison.js`)
- Newspaper column layout for brand comparison
- Mantine Cards for individual hotel results
- Typography emphasis for best rates (headline style)
- Mantine Badge components for savings highlights
- **AI Summary Section**: Plain English explanation of best deals found
- Direct booking buttons with Mantine Button styling

#### 3. Discount Code Manager (`/frontend/src/components/DiscountCodeManager.js`)
- Mantine Table for code listing
- Simple add/edit/delete functionality
- No validation - store codes exactly as user provides
- Mantine Modal for code entry forms

## Data Models

### Database Schema Extensions

#### discount_codes Table
```sql
CREATE TABLE discount_codes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  corporate_name VARCHAR(100),
  code_value VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### hotel_searches Table
```sql
CREATE TABLE hotel_searches (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  search_location VARCHAR(200),
  check_in_date DATE,
  check_out_date DATE,
  guest_count INTEGER DEFAULT 1,
  codes_used TEXT[], -- JSON array of codes used
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### hotel_rates Table
```sql
CREATE TABLE hotel_rates (
  id SERIAL PRIMARY KEY,
  search_id INTEGER REFERENCES hotel_searches(id),
  hotel_name VARCHAR(200),
  brand VARCHAR(100),
  parent_company VARCHAR(50),
  original_rate DECIMAL(10,2),
  discounted_rate DECIMAL(10,2),
  discount_code VARCHAR(50),
  savings_amount DECIMAL(10,2),
  savings_percentage DECIMAL(5,2),
  booking_url TEXT,
  hotel_address TEXT,
  amenities TEXT[], -- JSON array
  rating DECIMAL(3,2),
  review_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### hotel_brands Table (Reference Data)
```sql
CREATE TABLE hotel_brands (
  id SERIAL PRIMARY KEY,
  parent_company ENUM('hilton', 'marriott'),
  brand_name VARCHAR(100),
  brand_code VARCHAR(20),
  booking_url_template TEXT,
  is_active BOOLEAN DEFAULT true
);
```

### API Response Models

#### Hotel Search Result
```javascript
{
  hotelId: string,
  hotelName: string,
  brand: string,
  parentCompany: 'hilton' | 'marriott',
  location: {
    address: string,
    city: string,
    coordinates: { lat: number, lng: number }
  },
  rates: [
    {
      originalRate: number,
      discountedRate: number,
      discountCode: string,
      savings: number,
      savingsPercentage: number,
      bookingUrl: string
    }
  ],
  amenities: string[],
  rating: number,
  reviewCount: number
}
```

## AI Integration Strategy

### OpenAI Use Cases

#### 1. Natural Language Search Processing
- **Input**: "Find me a hotel in Manhattan for this weekend under $200"
- **AI Processing**: Extract location (Manhattan), dates (this weekend), budget ($200)
- **Output**: Structured search parameters for hotel APIs

#### 2. Web Scraping Data Extraction
- **Input**: Raw HTML from hotel booking pages
- **AI Processing**: Extract hotel name, price, amenities, address from messy HTML
- **Output**: Clean JSON data for database storage
- **Prompt**: "Extract hotel information from this HTML: name, price, address, amenities"

#### 3. Search Result Summarization
- **Input**: Array of hotel search results with rates and codes
- **AI Processing**: Analyze best deals, savings, and recommendations
- **Output**: "Best deal: Hampton Inn with GE code saves you $45 (23%). Marriott options are $20 more but closer to downtown."

#### 4. Location Intelligence
- **Input**: Vague location like "near Times Square"
- **AI Processing**: Suggest specific neighborhoods, nearby areas, alternative locations
- **Output**: Structured location suggestions with reasons

## Technical Implementation Strategy

### Phase 1: API Integration Approach
**Primary Strategy**: Official Hotel APIs (if available)
- Research Hilton and Marriott developer programs
- Investigate third-party aggregator APIs (Booking.com, Expedia)
- Pros: Reliable, structured data, terms-compliant
- Cons: May have rate limits, might not support all discount codes

### Phase 2: Fallback Strategy
**Secondary Strategy**: Controlled Web Automation
- Use Playwright/Puppeteer for browser automation
- Implement respectful scraping with delays and user-agent rotation
- Focus on mobile-optimized booking flows (often simpler)
- Pros: Access to all publicly available rates and codes
- Cons: More fragile, requires maintenance, legal considerations

### Phase 3: Hybrid Approach
- Use APIs where available for basic hotel data
- Supplement with targeted automation for discount code validation
- Cache results aggressively to minimize external requests

## Error Handling

### Rate Search Failures
- **Timeout Handling**: 30-second timeout per hotel search
- **Partial Results**: Display available results even if some sources fail
- **Retry Logic**: Exponential backoff for temporary failures
- **User Feedback**: Clear error messages for different failure types

### Discount Code Handling
- **No Validation**: Use codes exactly as provided by user
- **Simple Storage**: Store corporate name and code value only
- **Rate Comparison**: Attempt all codes on all hotels, display results

### Data Quality
- **Rate Validation**: Flag suspiciously low/high rates for manual review
- **Currency Handling**: Ensure consistent currency across comparisons
- **Date Validation**: Prevent searches for past dates

## Testing Strategy

### Unit Testing
- Discount code validation logic
- Rate comparison algorithms
- Data model validation
- API response parsing

### Integration Testing
- Hotel search service with mock adapters
- Database operations for discount codes and search history
- Authentication integration with existing Supabase setup

### End-to-End Testing
- Complete search flow from frontend to results
- Discount code application across different scenarios
- Error handling for various failure modes

### Performance Testing
- Concurrent search handling
- Response time optimization
- Cache effectiveness measurement

## Security Considerations

### API Key Management
- Store hotel API keys in environment variables
- Rotate keys regularly
- Monitor API usage and rate limits

### User Data Protection
- Encrypt stored discount codes
- Audit trail for code usage
- Respect user privacy in search history

### Rate Scraping Ethics
- Implement respectful delays between requests
- Honor robots.txt and terms of service
- Use appropriate user agents
- Implement circuit breakers for overloaded sites

## Performance Optimization

### Caching Strategy
- **Search Results**: Cache for 15 minutes (rates change frequently)
- **Hotel Metadata**: Cache for 24 hours (static information)
- **Brand Compatibility**: Cache indefinitely (rarely changes)

### Async Processing
- Parallel hotel searches across brands
- Background discount code validation
- Asynchronous result aggregation

### Database Optimization
- Index on user_id, search_location, and date ranges
- Partition search history by date
- Regular cleanup of old search results

## Deployment Considerations

### Environment Variables
```
# Hotel API Keys
HILTON_API_KEY=
MARRIOTT_API_KEY=
BOOKING_API_KEY=

# OpenAI Integration (already available)
OPENAI_API_KEY=

# Rate Limiting
MAX_SEARCHES_PER_HOUR=50
CACHE_TTL_MINUTES=15

# Browser Automation (if needed)
PLAYWRIGHT_HEADLESS=true
BROWSER_TIMEOUT_MS=30000
```

### Frontend Dependencies
```json
{
  "@mantine/core": "^7.x.x",
  "@mantine/hooks": "^7.x.x",
  "@mantine/dates": "^7.x.x",
  "@mantine/form": "^7.x.x"
}
```

### Monitoring
- Track search success rates by hotel brand
- Monitor API response times and failures
- Alert on unusual discount code validation patterns
- Log rate comparison accuracy metrics