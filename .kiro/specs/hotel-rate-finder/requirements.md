# Requirements Document

## Introduction

The Hotel Rate Finder feature enables users to efficiently compare hotel rates across Hilton and Marriott brand properties using multiple discount codes. The system automates the time-consuming process of manually searching different hotel brands and testing various discount codes to find the best available rate for a specific location and date range.

## Glossary

- **Hotel_Rate_Finder**: The system component that searches and compares hotel rates
- **Discount_Code**: A promotional code (corporate, rate, or percentage-based) that provides reduced rates at specific hotel brands, often with varying formats and brand restrictions
- **Hotel_Brand**: A specific hotel chain (e.g., Hampton Inn, Courtyard, etc.) under parent companies Hilton or Marriott
- **Rate_Search**: A query for hotel availability and pricing for specific dates and location
- **Best_Rate**: The lowest available rate found across all searched hotels and discount codes
- **User**: An authenticated person using the Hotel Rate Finder system

## Requirements

### Requirement 1

**User Story:** As a traveler with multiple hotel discount codes, I want to search for hotels in a specific city with my available discount codes, so that I can quickly find the best rate without manually checking each brand and code combination.

#### Acceptance Criteria

1. WHEN the User enters a city name and travel dates, THE Hotel_Rate_Finder SHALL search for available hotels from both Hilton and Marriott brand properties
2. WHEN the User provides multiple Discount_Codes, THE Hotel_Rate_Finder SHALL apply each code only to its compatible Hotel_Brands and test all variations for multi-code corporate accounts
3. WHEN rate searches are completed, THE Hotel_Rate_Finder SHALL display results sorted by lowest price first
4. WHERE the User has saved Discount_Codes, THE Hotel_Rate_Finder SHALL automatically include them in searches
5. IF no hotels are found for the specified criteria, THEN THE Hotel_Rate_Finder SHALL display a message indicating no availability

### Requirement 2

**User Story:** As a user with various corporate and promotional discount codes, I want to manage my collection of codes with their specific brand restrictions and formats, so that I can keep track of which codes work with which hotel brands and avoid testing incompatible combinations.

#### Acceptance Criteria

1. THE Hotel_Rate_Finder SHALL allow Users to add Discount_Codes with corporate names, code variations, and specific Hotel_Brand restrictions
2. THE Hotel_Rate_Finder SHALL store multiple code variations for the same corporate account (e.g., IBM's multiple formats)
3. THE Hotel_Rate_Finder SHALL track brand-specific restrictions (e.g., Blackstone codes only for Conrad, Waldorf, HGI vs Homewood vs DoubleTree/Hilton)
4. THE Hotel_Rate_Finder SHALL support both percentage-based codes (e.g., 10% system-wide) and rate codes
5. THE Hotel_Rate_Finder SHALL allow Users to organize codes by corporate source and edit brand compatibility settings

### Requirement 3

**User Story:** As a user comparing hotel options, I want to see detailed rate comparison results, so that I can make an informed decision about which hotel and discount code combination offers the best value.

#### Acceptance Criteria

1. WHEN displaying search results, THE Hotel_Rate_Finder SHALL show the hotel name, brand, original rate, discounted rate, and applied Discount_Code
2. THE Hotel_Rate_Finder SHALL calculate and display the savings amount for each discounted rate
3. THE Hotel_Rate_Finder SHALL group results by parent company (Hilton vs Marriott) for easy comparison
4. THE Hotel_Rate_Finder SHALL provide direct booking links for each hotel result
5. WHILE displaying results, THE Hotel_Rate_Finder SHALL highlight the Best_Rate option clearly

### Requirement 4

**User Story:** As a user with corporate discount codes, I want the system to intelligently handle code variations and brand restrictions, so that I don't waste time testing incompatible combinations or miss better rates from alternative code formats.

#### Acceptance Criteria

1. WHEN a corporate account has multiple Discount_Code variations, THE Hotel_Rate_Finder SHALL test all applicable formats automatically
2. THE Hotel_Rate_Finder SHALL skip brand-incompatible codes during searches to improve efficiency
3. WHEN displaying results, THE Hotel_Rate_Finder SHALL show which specific code variation produced each rate
4. THE Hotel_Rate_Finder SHALL prioritize system-wide percentage codes (like FedEx 10%) when applicable across all brands
5. IF a Hotel_Brand has specific code restrictions, THEN THE Hotel_Rate_Finder SHALL only test compatible codes for that brand

### Requirement 5

**User Story:** As a frequent traveler, I want to save my search preferences and favorite discount codes, so that I can quickly repeat searches without re-entering the same information.

#### Acceptance Criteria

1. THE Hotel_Rate_Finder SHALL save the User's most recently used search criteria
2. THE Hotel_Rate_Finder SHALL allow Users to mark Discount_Codes as favorites for priority use
3. WHEN starting a new search, THE Hotel_Rate_Finder SHALL pre-populate the last used city and date range
4. THE Hotel_Rate_Finder SHALL remember which Discount_Codes the User prefers to include by default
5. THE Hotel_Rate_Finder SHALL provide search history for the User's previous Rate_Searches