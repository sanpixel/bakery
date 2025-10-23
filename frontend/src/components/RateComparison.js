import React, { useState } from 'react';
import {
  Paper,
  Grid,
  Card,
  Text,
  Badge,
  Button,
  Group,
  Stack,
  Divider,
  Select,
  Alert,
  ActionIcon,
  Anchor
} from '@mantine/core';
import { 
  IconStar, 
  IconMapPin, 
  IconExternalLink, 
  IconTrophy,
  IconSortAscending,
  IconSortDescending,
  IconFilter
} from '@tabler/icons-react';

/**
 * Rate Comparison Component
 * Displays hotel search results with newspaper-style layout and AI insights
 */
function RateComparison({ searchResults }) {
  const [sortBy, setSortBy] = useState('price');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterBrand, setFilterBrand] = useState('all');

  if (!searchResults || !searchResults.results || searchResults.results.length === 0) {
    return (
      <Paper p="lg" withBorder>
        <Text ta="center" c="dimmed">
          No search results to display. Use the search form to find hotels.
        </Text>
      </Paper>
    );
  }

  /**
   * Sort and filter results based on user preferences
   */
  const getSortedAndFilteredResults = () => {
    let filtered = searchResults.results;
    
    // Filter by brand
    if (filterBrand !== 'all') {
      filtered = filtered.filter(result => 
        result.parent_company?.toLowerCase() === filterBrand.toLowerCase()
      );
    }
    
    // Sort results
    const sorted = [...filtered].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'price':
          aValue = a.discounted_rate || a.original_rate || Infinity;
          bValue = b.discounted_rate || b.original_rate || Infinity;
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
          aValue = a.discounted_rate || a.original_rate || Infinity;
          bValue = b.discounted_rate || b.original_rate || Infinity;
      }
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });
    
    return sorted;
  };

  /**
   * Group results by parent company
   */
  const getGroupedResults = () => {
    const sorted = getSortedAndFilteredResults();
    const grouped = {
      hilton: [],
      marriott: [],
      other: []
    };
    
    sorted.forEach(result => {
      const company = result.parent_company?.toLowerCase();
      if (company === 'hilton') {
        grouped.hilton.push(result);
      } else if (company === 'marriott') {
        grouped.marriott.push(result);
      } else {
        grouped.other.push(result);
      }
    });
    
    return grouped;
  };

  /**
   * Format price display
   */
  const formatPrice = (price) => {
    return price ? `$${price.toFixed(2)}` : 'N/A';
  };

  /**
   * Get savings badge color
   */
  const getSavingsBadgeColor = (savingsPercentage) => {
    if (savingsPercentage >= 20) return 'green';
    if (savingsPercentage >= 10) return 'blue';
    if (savingsPercentage > 0) return 'orange';
    return 'gray';
  };

  /**
   * Render individual hotel card
   */
  const renderHotelCard = (result, index, isBestRate = false) => (
    <Card key={`${result.hotel_name}-${index}`} shadow="sm" padding="md" withBorder>
      {/* Best Rate Badge */}
      {isBestRate && (
        <Badge 
          color="gold" 
          variant="filled" 
          leftSection={<IconTrophy size={12} />}
          mb="xs"
        >
          Best Rate
        </Badge>
      )}
      
      {/* Hotel Name and Brand */}
      <Group justify="space-between" mb="xs">
        <div>
          <Text fw={600} size="lg" lineClamp={1}>
            {result.hotel_name}
          </Text>
          <Badge variant="light" size="sm">
            {result.brand}
          </Badge>
        </div>
        
        {/* Rating */}
        {result.rating && (
          <Group gap="xs">
            <IconStar size={16} fill="gold" color="gold" />
            <Text size="sm" fw={500}>
              {result.rating}
            </Text>
            {result.review_count && (
              <Text size="xs" c="dimmed">
                ({result.review_count})
              </Text>
            )}
          </Group>
        )}
      </Group>

      {/* Address */}
      {result.hotel_address && (
        <Group gap="xs" mb="sm">
          <IconMapPin size={14} color="gray" />
          <Text size="sm" c="dimmed" lineClamp={1}>
            {result.hotel_address}
          </Text>
        </Group>
      )}

      {/* Pricing */}
      <Stack gap="xs" mb="md">
        <Group justify="space-between">
          <Text size="sm" c="dimmed">Rate:</Text>
          <div style={{ textAlign: 'right' }}>
            {result.original_rate && result.discounted_rate && result.original_rate !== result.discounted_rate ? (
              <>
                <Text size="sm" td="line-through" c="dimmed">
                  {formatPrice(result.original_rate)}
                </Text>
                <Text size="lg" fw={700} c="green">
                  {formatPrice(result.discounted_rate)}
                </Text>
              </>
            ) : (
              <Text size="lg" fw={700}>
                {formatPrice(result.discounted_rate || result.original_rate)}
              </Text>
            )}
          </div>
        </Group>

        {/* Discount Code and Savings */}
        {result.discount_code && (
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Code:</Text>
            <Text size="sm" ff="monospace" fw={500}>
              {result.discount_code}
            </Text>
          </Group>
        )}
        
        {result.savings_amount > 0 && (
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Savings:</Text>
            <Badge 
              color={getSavingsBadgeColor(result.savings_percentage)}
              variant="light"
            >
              {formatPrice(result.savings_amount)} ({result.savings_percentage?.toFixed(1)}%)
            </Badge>
          </Group>
        )}
      </Stack>

      {/* Amenities */}
      {result.amenities && result.amenities.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <Text size="xs" c="dimmed" mb="xs">Amenities:</Text>
          <Group gap="xs">
            {(typeof result.amenities === 'string' ? JSON.parse(result.amenities) : result.amenities)
              .slice(0, 3)
              .map((amenity, idx) => (
                <Badge key={idx} variant="outline" size="xs">
                  {amenity}
                </Badge>
              ))}
          </Group>
        </div>
      )}

      {/* Booking Button */}
      <Button 
        fullWidth 
        rightSection={<IconExternalLink size={16} />}
        component="a"
        href={result.booking_url}
        target="_blank"
        rel="noopener noreferrer"
      >
        Book Now
      </Button>
    </Card>
  );

  const groupedResults = getGroupedResults();
  const sortedResults = getSortedAndFilteredResults();
  const bestRate = searchResults.bestRate;

  return (
    <div>
      {/* AI Summary Section */}
      {searchResults.aiSummary && (
        <Paper p="lg" mb="lg" style={{ backgroundColor: '#e8f5e8' }}>
          <Text size="lg" fw={600} mb="md">🤖 AI Analysis</Text>
          
          <Stack gap="sm">
            <div>
              <Text fw={500} mb="xs">Summary:</Text>
              <Text size="sm">{searchResults.aiSummary.summary}</Text>
            </div>
            
            {searchResults.aiSummary.bestDeal && (
              <div>
                <Text fw={500} mb="xs">Best Deal:</Text>
                <Text size="sm" c="green">{searchResults.aiSummary.bestDeal}</Text>
              </div>
            )}
            
            {searchResults.aiSummary.savings && (
              <div>
                <Text fw={500} mb="xs">Savings Analysis:</Text>
                <Text size="sm">{searchResults.aiSummary.savings}</Text>
              </div>
            )}
            
            {searchResults.aiSummary.recommendations && searchResults.aiSummary.recommendations.length > 0 && (
              <div>
                <Text fw={500} mb="xs">Recommendations:</Text>
                <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                  {searchResults.aiSummary.recommendations.map((rec, idx) => (
                    <li key={idx}>
                      <Text size="sm">{rec}</Text>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Stack>
        </Paper>
      )}

      {/* Controls */}
      <Paper p="md" mb="lg" withBorder>
        <Group justify="space-between">
          <Group>
            <Select
              label="Sort by"
              value={sortBy}
              onChange={setSortBy}
              data={[
                { value: 'price', label: 'Price' },
                { value: 'savings', label: 'Savings' },
                { value: 'rating', label: 'Rating' },
                { value: 'brand', label: 'Brand' }
              ]}
              size="sm"
            />
            
            <ActionIcon
              variant="light"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortOrder === 'asc' ? <IconSortAscending size={16} /> : <IconSortDescending size={16} />}
            </ActionIcon>
          </Group>
          
          <Select
            label="Filter by brand"
            value={filterBrand}
            onChange={setFilterBrand}
            data={[
              { value: 'all', label: 'All Brands' },
              { value: 'hilton', label: 'Hilton' },
              { value: 'marriott', label: 'Marriott' }
            ]}
            size="sm"
          />
        </Group>
      </Paper>

      {/* Results Summary */}
      <Alert mb="lg" variant="light">
        <Text size="sm">
          Showing {sortedResults.length} of {searchResults.totalResults} results
          {searchResults.totalSavings > 0 && (
            <> • Total potential savings: <strong>{formatPrice(searchResults.totalSavings)}</strong></>
          )}
        </Text>
      </Alert>

      {/* Results by Brand */}
      <Stack gap="xl">
        {/* Hilton Results */}
        {groupedResults.hilton.length > 0 && (
          <div>
            <Text size="xl" fw={700} mb="md" style={{ borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>
              Hilton Properties ({groupedResults.hilton.length})
            </Text>
            <Grid>
              {groupedResults.hilton.map((result, index) => (
                <Grid.Col key={index} span={{ base: 12, sm: 6, lg: 4 }}>
                  {renderHotelCard(result, index, bestRate && result.hotel_name === bestRate.hotel_name)}
                </Grid.Col>
              ))}
            </Grid>
          </div>
        )}

        {/* Marriott Results */}
        {groupedResults.marriott.length > 0 && (
          <div>
            <Text size="xl" fw={700} mb="md" style={{ borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>
              Marriott Properties ({groupedResults.marriott.length})
            </Text>
            <Grid>
              {groupedResults.marriott.map((result, index) => (
                <Grid.Col key={index} span={{ base: 12, sm: 6, lg: 4 }}>
                  {renderHotelCard(result, index, bestRate && result.hotel_name === bestRate.hotel_name)}
                </Grid.Col>
              ))}
            </Grid>
          </div>
        )}

        {/* Other Results */}
        {groupedResults.other.length > 0 && (
          <div>
            <Text size="xl" fw={700} mb="md" style={{ borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>
              Other Properties ({groupedResults.other.length})
            </Text>
            <Grid>
              {groupedResults.other.map((result, index) => (
                <Grid.Col key={index} span={{ base: 12, sm: 6, lg: 4 }}>
                  {renderHotelCard(result, index, bestRate && result.hotel_name === bestRate.hotel_name)}
                </Grid.Col>
              ))}
            </Grid>
          </div>
        )}
      </Stack>
    </div>
  );
}

export default RateComparison;