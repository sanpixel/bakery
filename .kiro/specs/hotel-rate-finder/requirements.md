# Requirements Document

## Introduction

The Hotel Rate Finder feature enables users to efficiently compare hotel rates across Hilton and Marriott brand properties using multiple discount codes. The system automates the time-consuming process of manually searching different hotel brands and testing various discount codes to find the best available rate for a specific location and date range.

## Glossary

- **Hotel_Rate_Finder**: The system component that searches and compares hotel rates
- **Discount_Code**: A promotional code that provides reduced rates at specific hotel brands
- **Hotel_Brand**: A specific hotel chain (e.g., Hampton Inn, Courtyard, etc.) under parent companies Hilton or Marriott
- **Rate_Search**: A query for hotel availability and pricing for specific dates and location
- **Best_Rate**: The lowest available rate found across all searched hotels and discount codes
- **User**: An authenticated person using the Hotel Rate Finder system

## Requirements

### Requirement 1

**User Story:** As a traveler with multiple hotel discount codes, I want to search for hotels in a specific city with my available discount codes, so that I can quickly find the best rate without manually checking each brand and code combination.

#### Acceptance Criteria

1. WHEN the User enters a city name and travel dates, THE Hotel_Rate_Finder SHALL search for available hotels from both Hilton and Marriott brand properties
2. WHEN the User provides multiple Discount_Codes, THE Hotel_Rate_Finder SHALL apply each code to compatible Hotel_Brands during the search
3. WHEN rate searches are completed, THE Hotel_Rate_Finder SHALL display results sorted by lowest price first
4. WHERE the User has saved Discount_Codes, THE Hotel_Rate_Finder SHALL automatically include them in searches
5. IF no hotels are found for the specified criteria, THEN THE Hotel_Rate_Finder SHALL display a message indicating no availability

### Requirement 2

**User Story:** As a user with various discount codes, I want to manage my collection of Hilton and Marriott discount codes, so that I can keep track of which codes work with which hotel brands and their expiration dates.

#### Acceptance Criteria

1. THE Hotel_Rate_Finder SHALL allow Users to add new Discount_Codes with brand compatibility information
2. THE Hotel_Rate_Finder SHALL store Discount_Codes with their applicable Hotel_Brands and expiration dates
3. WHEN a Discount_Code expires, THE Hotel_Rate_Finder SHALL exclude it from Rate_Searches
4. THE Hotel_Rate_Finder SHALL allow Users to edit or delete existing Discount_Codes
5. THE Hotel_Rate_Finder SHALL display all saved Discount_Codes with their current status

### Requirement 3

**User Story:** As a user comparing hotel options, I want to see detailed rate comparison results, so that I can make an informed decision about which hotel and discount code combination offers the best value.

#### Acceptance Criteria

1. WHEN displaying search results, THE Hotel_Rate_Finder SHALL show the hotel name, brand, original rate, discounted rate, and applied Discount_Code
2. THE Hotel_Rate_Finder SHALL calculate and display the savings amount for each discounted rate
3. THE Hotel_Rate_Finder SHALL group results by parent company (Hilton vs Marriott) for easy comparison
4. THE Hotel_Rate_Finder SHALL provide direct booking links for each hotel result
5. WHILE displaying results, THE Hotel_Rate_Finder SHALL highlight the Best_Rate option clearly

### Requirement 4

**User Story:** As a frequent traveler, I want to save my search preferences and favorite discount codes, so that I can quickly repeat searches without re-entering the same information.

#### Acceptance Criteria

1. THE Hotel_Rate_Finder SHALL save the User's most recently used search criteria
2. THE Hotel_Rate_Finder SHALL allow Users to mark Discount_Codes as favorites for priority use
3. WHEN starting a new search, THE Hotel_Rate_Finder SHALL pre-populate the last used city and date range
4. THE Hotel_Rate_Finder SHALL remember which Discount_Codes the User prefers to include by default
5. THE Hotel_Rate_Finder SHALL provide search history for the User's previous Rate_Searches