# Implementation Plan

- [x] 1. Set up database schema and core data models



  - Create database migration files for new tables (discount_codes, hotel_searches, hotel_rates, hotel_brands)
  - Add database initialization code to backend/index.js for new tables
  - Create data model interfaces/types for TypeScript support
  - _Requirements: 2.1, 2.2, 3.1_




- [x] 2. Implement discount code management backend

- [x] 2.1 Create discount code API endpoints

  - Write GET /api/discount-codes endpoint to retrieve user's codes

  - Write POST /api/discount-codes endpoint to add new codes
  - Write DELETE /api/discount-codes/:id endpoint to remove codes
  - _Requirements: 2.1, 2.5_

- [x] 2.2 Create discount code service layer

  - Implement discountCodeService.js with database operations
  - Add user authentication middleware for code management
  - _Requirements: 2.1, 2.2_

- [x] 2.3 Write unit tests for discount code management


  - Create tests for API endpoints
  - Test database operations and error handling
  - _Requirements: 2.1, 2.5_

- [x] 3. Build AI assistant service for enhanced user experience


- [x] 3.1 Create AI assistant service foundation


  - Implement aiAssistantService.js with OpenAI integration
  - Add parseNaturalLanguageSearch method for converting user input to structured search
  - Create extractHotelData method for parsing scraped HTML into clean JSON
  - Add generateSearchSuggestions method for location and date recommendations
  - _Requirements: 1.1, 1.2_

- [x] 3.2 Add AI result summarization


  - Implement summarizeResults method to create plain English summaries
  - Add AI-powered best deal explanations and recommendations
  - Create user-friendly explanations of savings and code effectiveness
  - _Requirements: 3.1, 3.2_

- [x] 3.3 Write AI service tests


  - Create tests for natural language parsing
  - Test HTML data extraction accuracy
  - Verify result summarization quality
  - _Requirements: 1.1, 3.1_

- [x] 4. Build hotel search infrastructure


- [x] 4.1 Create hotel search service foundation


  - Implement hotelSearchService.js with basic search orchestration
  - Create hotel data adapter interface/base class
  - Add search result aggregation and comparison logic
  - Integrate with AI assistant for data processing
  - _Requirements: 1.1, 1.3, 3.1_

- [x] 4.2 Implement hotel brand adapters with AI integration


  - Create hiltonAdapter.js for Hilton property searches
  - Create marriottAdapter.js for Marriott property searches
  - Implement fallback web scraping logic using Playwright
  - Integrate AI assistant for HTML data extraction and parsing
  - _Requirements: 1.1, 1.2_

- [x] 4.3 Create hotel search API endpoints


  - Write POST /api/hotel-search endpoint for rate searches
  - Write POST /api/natural-search endpoint for AI-powered natural language search
  - Write GET /api/hotel-search/:id endpoint for search results
  - Add search history storage to database
  - _Requirements: 1.1, 1.3, 5.5_

- [x] 4.4 Add hotel search testing


  - Create mock adapters for testing
  - Write integration tests for search flow
  - Test rate comparison logic
  - Test AI integration with mock responses
  - _Requirements: 1.1, 1.3, 3.1_

- [x] 5. Implement rate comparison and storage


- [x] 5.1 Build rate comparison engine


  - Create rateComparisonService.js with best rate identification
  - Implement savings calculation logic
  - Add rate ranking and sorting functionality
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 5.2 Add rate persistence layer

  - Implement codewallet_hotel_rates table operations
  - Store all search results for historical tracking
  - Add rate retrieval and filtering methods
  - _Requirements: 3.1, 5.5_

- [x] 5.3 Create rate comparison tests


  - Test savings calculation accuracy
  - Verify rate ranking logic
  - Test database storage operations
  - _Requirements: 3.1, 3.2_

- [x] 6. Install and configure Mantine UI framework


- [x] 6.1 Add Mantine dependencies to frontend


  - Install @mantine/core, @mantine/hooks, @mantine/dates, @mantine/form
  - Configure Mantine theme and providers in App.js
  - Set up newspaper-style CSS variables and typography
  - _Requirements: 1.1, 3.3_

- [x] 6.2 Create base layout components


  - Build newspaper-style layout wrapper component
  - Create responsive grid system for multi-column display
  - Implement header section for hotel search
  - _Requirements: 1.1, 3.3_

- [x] 7. Build discount code management UI


- [x] 7.1 Create discount code manager component


  - Build DiscountCodeManager.js with Mantine Table
  - Implement add/edit/delete code functionality
  - Create Mantine Modal for code entry forms
  - _Requirements: 2.1, 2.4, 2.5_

- [x] 7.2 Integrate discount code UI with backend


  - Connect component to discount code API endpoints
  - Add error handling and loading states
  - Implement real-time code list updates
  - _Requirements: 2.1, 2.5_

- [x] 8. Implement hotel search form UI with AI integration


- [x] 8.1 Create hotel search form component with AI features


  - Build HotelSearchForm.js with Mantine inputs
  - Add location TextInput with autocomplete
  - Implement DatePicker for check-in/check-out dates
  - Create MultiSelect for discount code selection
  - Add AI natural language input field for "Find me a cheap hotel in NYC next weekend"
  - _Requirements: 1.1, 1.2, 5.3_

- [x] 8.2 Connect search form to backend with AI processing


  - Integrate form with hotel search API
  - Connect natural language input to AI assistant service
  - Add form validation and submission handling
  - Implement loading states during search and AI processing
  - _Requirements: 1.1, 1.2_

- [x] 9. Build rate comparison display UI with AI summaries


- [x] 9.1 Create rate comparison component with AI integration


  - Build RateComparison.js with newspaper column layout
  - Implement Mantine Cards for individual hotel results
  - Add best rate highlighting with typography emphasis
  - Create savings badges and booking buttons
  - Add AI summary section with plain English explanations of best deals
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 9.2 Add interactive features to results with AI insights


  - Implement sorting and filtering options
  - Add brand grouping (Hilton vs Marriott sections)
  - Create direct booking link integration
  - Display AI-generated recommendations and deal explanations
  - _Requirements: 3.3, 3.4, 3.5_

- [x] 10. Implement user preferences and search history


- [x] 10.1 Add search preferences storage


  - Create user preferences API endpoints
  - Implement last search criteria persistence
  - Add favorite discount codes functionality
  - _Requirements: 5.1, 5.2, 5.4_

- [x] 10.2 Build search history UI


  - Create search history component with Mantine styling
  - Add search result caching and retrieval
  - Implement quick re-search functionality
  - _Requirements: 5.3, 5.5_

- [x] 11. Integration and final wiring



- [x] 11.1 Integrate all components into main app


  - Add hotel rate finder routes to React Router
  - Update main navigation to include hotel search
  - Connect all UI components with backend services
  - _Requirements: 1.1, 2.1, 3.1_

- [x] 11.2 Add error handling and user feedback


  - Implement comprehensive error handling across all components
  - Add user-friendly error messages and loading states
  - Create fallback UI for when hotel searches fail
  - _Requirements: 1.5, 3.1_

- [x] 11.3 End-to-end testing and optimization


  - Test complete user flow from login to booking
  - Optimize search performance and caching
  - Verify newspaper-style UI responsiveness
  - _Requirements: 1.1, 3.1, 5.1_