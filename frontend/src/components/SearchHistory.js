import React, { useState, useEffect } from 'react';
import {
  Stack,
  Text,
  Paper,
  Group,
  Badge,
  Button,
  LoadingOverlay,
  Alert,
  ActionIcon
} from '@mantine/core';
import { IconHistory, IconSearch, IconMapPin, IconCalendar } from '@tabler/icons-react';

/**
 * Search History Component
 * Displays user's recent hotel searches with quick re-search functionality
 */
function SearchHistory({ onReSearch }) {
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSearchHistory();
  }, []);

  /**
   * Load user's search history
   */
  const loadSearchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/search-history?user_id=00000000-0000-0000-0000-000000000000&limit=5');
      
      if (!response.ok) {
        throw new Error('Failed to load search history');
      }
      
      const data = await response.json();
      setSearches(data);
    } catch (err) {
      console.error('Error loading search history:', err);
      setError('Failed to load search history');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Handle re-search
   */
  const handleReSearch = (search) => {
    if (onReSearch) {
      const searchParams = {
        location: search.search_location,
        checkIn: search.check_in_date ? new Date(search.check_in_date) : null,
        checkOut: search.check_out_date ? new Date(search.check_out_date) : null,
        guests: search.guest_count || 1,
        selectedCodes: search.codes_used ? JSON.parse(search.codes_used) : []
      };
      onReSearch(searchParams);
    }
  };

  if (loading) {
    return (
      <div style={{ position: 'relative', minHeight: '100px' }}>
        <LoadingOverlay visible={loading} />
      </div>
    );
  }

  if (error) {
    return (
      <Alert color="red" variant="light">
        {error}
      </Alert>
    );
  }

  if (searches.length === 0) {
    return (
      <Text ta="center" c="dimmed" py="md" size="sm">
        No search history yet.<br />
        Your recent searches will appear here.
      </Text>
    );
  }

  return (
    <Stack gap="sm">
      {searches.map((search) => (
        <Paper key={search.id} p="sm" withBorder>
          <Group justify="space-between" align="flex-start">
            <div style={{ flex: 1 }}>
              {/* Location */}
              <Group gap="xs" mb="xs">
                <IconMapPin size={14} color="gray" />
                <Text size="sm" fw={500} lineClamp={1}>
                  {search.search_location}
                </Text>
              </Group>
              
              {/* Dates */}
              {search.check_in_date && search.check_out_date && (
                <Group gap="xs" mb="xs">
                  <IconCalendar size={14} color="gray" />
                  <Text size="xs" c="dimmed">
                    {new Date(search.check_in_date).toLocaleDateString()} - {new Date(search.check_out_date).toLocaleDateString()}
                  </Text>
                </Group>
              )}
              
              {/* Codes Used */}
              {search.codes_used && (
                <Group gap="xs" mb="xs">
                  <Text size="xs" c="dimmed">Codes:</Text>
                  {JSON.parse(search.codes_used).slice(0, 2).map((code, idx) => (
                    <Badge key={idx} variant="outline" size="xs">
                      {code}
                    </Badge>
                  ))}
                  {JSON.parse(search.codes_used).length > 2 && (
                    <Text size="xs" c="dimmed">
                      +{JSON.parse(search.codes_used).length - 2} more
                    </Text>
                  )}
                </Group>
              )}
              
              {/* Search Date */}
              <Text size="xs" c="dimmed">
                {formatDate(search.created_at)}
              </Text>
            </div>
            
            {/* Re-search Button */}
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() => handleReSearch(search)}
              title="Search again"
            >
              <IconSearch size={16} />
            </ActionIcon>
          </Group>
        </Paper>
      ))}
      
      {searches.length >= 5 && (
        <Text ta="center" size="xs" c="dimmed">
          Showing 5 most recent searches
        </Text>
      )}
    </Stack>
  );
}

export default SearchHistory;