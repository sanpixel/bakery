import React, { useState, useEffect } from 'react';
import {
  Paper,
  TextInput,
  Button,
  Group,
  Stack,
  Text,
  NumberInput,
  MultiSelect,
  Textarea,
  Alert,
  LoadingOverlay,
  Tabs,
  Badge
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconSearch, IconRobot, IconMapPin, IconCalendar, IconUsers, IconTag } from '@tabler/icons-react';

/**
 * Hotel Search Form Component
 * Supports both structured search and AI natural language input
 */
function HotelSearchForm({ onSearchResults }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [discountCodes, setDiscountCodes] = useState([]);
  const [activeTab, setActiveTab] = useState('structured');

  // Structured search form
  const structuredForm = useForm({
    initialValues: {
      location: '',
      checkIn: null,
      checkOut: null,
      guests: 1,
      selectedCodes: []
    },
    validate: {
      location: (value) => (!value ? 'Location is required' : null),
      checkIn: (value) => (!value ? 'Check-in date is required' : null),
      checkOut: (value) => (!value ? 'Check-out date is required' : null),
    },
  });

  // Natural language form
  const nlForm = useForm({
    initialValues: {
      naturalQuery: ''
    },
    validate: {
      naturalQuery: (value) => (!value ? 'Please describe your hotel search' : null),
    },
  });

  // Load user's discount codes on mount
  useEffect(() => {
    loadDiscountCodes();
  }, []);

  /**
   * Load available discount codes for selection
   */
  const loadDiscountCodes = async () => {
    try {
      const response = await fetch('/api/discount-codes?user_id=default-user');
      if (response.ok) {
        const codes = await response.json();
        setDiscountCodes(codes.map(code => ({
          value: code.code_value,
          label: `${code.corporate_name || 'Unknown'}: ${code.code_value}`,
          corporate_name: code.corporate_name
        })));
      }
    } catch (err) {
      console.error('Error loading discount codes:', err);
    }
  };

  /**
   * Handle structured search submission
   */
  const handleStructuredSearch = async (values) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = {
        location: values.location,
        checkIn: values.checkIn ? values.checkIn.toISOString().split('T')[0] : null,
        checkOut: values.checkOut ? values.checkOut.toISOString().split('T')[0] : null,
        guests: values.guests,
        discountCodes: values.selectedCodes
      };

      const response = await fetch('/api/hotel-search?user_id=default-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const results = await response.json();
      
      // Pass results to parent component
      if (onSearchResults) {
        onSearchResults(results);
      }

    } catch (err) {
      console.error('Search error:', err);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle natural language search submission
   */
  const handleNaturalLanguageSearch = async (values) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/natural-search?user_id=default-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: values.naturalQuery }),
      });

      if (!response.ok) {
        throw new Error('Natural language search failed');
      }

      const results = await response.json();
      
      // Pass results to parent component
      if (onSearchResults) {
        onSearchResults(results);
      }

    } catch (err) {
      console.error('Natural language search error:', err);
      setError('AI search failed. Please try the structured search instead.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get minimum date (today)
   */
  const getMinDate = () => {
    return new Date();
  };

  /**
   * Get minimum checkout date (day after checkin)
   */
  const getMinCheckoutDate = () => {
    const checkIn = structuredForm.values.checkIn;
    if (checkIn) {
      const minCheckout = new Date(checkIn);
      minCheckout.setDate(minCheckout.getDate() + 1);
      return minCheckout;
    }
    return new Date();
  };

  return (
    <Paper p="lg" withBorder style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} />
      
      <Text size="xl" fw={600} mb="md">
        Find Hotel Rates
      </Text>
      
      {error && (
        <Alert color="red" mb="md" onClose={() => setError(null)} withCloseButton>
          {error}
        </Alert>
      )}

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="structured" leftSection={<IconSearch size={16} />}>
            Structured Search
          </Tabs.Tab>
          <Tabs.Tab value="natural" leftSection={<IconRobot size={16} />}>
            AI Natural Language
          </Tabs.Tab>
        </Tabs.List>

        {/* Structured Search Tab */}
        <Tabs.Panel value="structured" pt="md">
          <form onSubmit={structuredForm.onSubmit(handleStructuredSearch)}>
            <Stack>
              <TextInput
                label="Location"
                placeholder="e.g., New York City, Manhattan, Times Square"
                leftSection={<IconMapPin size={16} />}
                required
                {...structuredForm.getInputProps('location')}
              />

              <Group grow>
                <DateInput
                  label="Check-in Date"
                  placeholder="Select check-in date"
                  leftSection={<IconCalendar size={16} />}
                  minDate={getMinDate()}
                  required
                  {...structuredForm.getInputProps('checkIn')}
                />
                
                <DateInput
                  label="Check-out Date"
                  placeholder="Select check-out date"
                  leftSection={<IconCalendar size={16} />}
                  minDate={getMinCheckoutDate()}
                  required
                  {...structuredForm.getInputProps('checkOut')}
                />
              </Group>

              <Group grow>
                <NumberInput
                  label="Number of Guests"
                  placeholder="1"
                  min={1}
                  max={8}
                  leftSection={<IconUsers size={16} />}
                  {...structuredForm.getInputProps('guests')}
                />
                
                <MultiSelect
                  label="Discount Codes"
                  placeholder="Select codes to try"
                  leftSection={<IconTag size={16} />}
                  data={discountCodes}
                  searchable
                  clearable
                  {...structuredForm.getInputProps('selectedCodes')}
                />
              </Group>

              <Button 
                type="submit" 
                size="lg" 
                leftSection={<IconSearch size={18} />}
                disabled={loading}
              >
                Search Hotels
              </Button>
            </Stack>
          </form>
        </Tabs.Panel>

        {/* Natural Language Search Tab */}
        <Tabs.Panel value="natural" pt="md">
          <form onSubmit={nlForm.onSubmit(handleNaturalLanguageSearch)}>
            <Stack>
              <div>
                <Text size="sm" c="dimmed" mb="xs">
                  Describe your hotel search in natural language:
                </Text>
                <Group gap="xs" mb="sm">
                  <Badge variant="light" size="xs">cheap hotel in NYC</Badge>
                  <Badge variant="light" size="xs">luxury resort Miami Beach next weekend</Badge>
                  <Badge variant="light" size="xs">business hotel Chicago March 15-17</Badge>
                </Group>
              </div>

              <Textarea
                placeholder="e.g., Find me a cheap hotel in Manhattan for 2 people this weekend"
                rows={4}
                required
                {...nlForm.getInputProps('naturalQuery')}
              />

              <Text size="xs" c="dimmed">
                💡 The AI will automatically use your saved discount codes and parse dates, locations, and preferences.
              </Text>

              <Button 
                type="submit" 
                size="lg" 
                leftSection={<IconRobot size={18} />}
                disabled={loading}
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan' }}
              >
                Search with AI
              </Button>
            </Stack>
          </form>
        </Tabs.Panel>
      </Tabs>

      {/* Discount Codes Info */}
      {discountCodes.length > 0 && (
        <Alert color="blue" mt="md" variant="light">
          <Text size="sm">
            <strong>{discountCodes.length} discount codes available:</strong>{' '}
            {discountCodes.slice(0, 3).map(code => code.corporate_name || 'Unknown').join(', ')}
            {discountCodes.length > 3 && ` and ${discountCodes.length - 3} more`}
          </Text>
        </Alert>
      )}
    </Paper>
  );
}

export default HotelSearchForm;