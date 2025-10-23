import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Title, 
  Text, 
  Paper, 
  Divider,
  Group,
  Badge,
  Button,
  Stack
} from '@mantine/core';
import { getSupabase } from '../supabaseClient';
import DiscountCodeManager from './DiscountCodeManager';
import HotelSearchForm from './HotelSearchForm';
import RateComparison from './RateComparison';
import SearchHistory from './SearchHistory';

/**
 * Main CodeWallet Application
 * Newspaper-style layout for hotel rate comparison
 */
function CodeWalletApp() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState(null);


  useEffect(() => {
    const setupAuth = async () => {
      try {
        const supabase = await getSupabase();
        
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        
        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session);
        });
        
        setLoading(false);
        
        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Auth setup error:', error);
        setLoading(false);
      }
    };
    
    setupAuth();
  }, []);

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Text ta="center">Loading CodeWallet...</Text>
      </Container>
    );
  }

  if (!session) {
    return (
      <Container size="xl" py="xl">
        <Paper p="xl" withBorder>
          <Title order={1} ta="center" mb="md">CodeWallet</Title>
          <Text ta="center" size="lg" c="dimmed">
            Please sign in to access your hotel discount codes and rate comparison tools.
          </Text>
          <Group justify="center" mt="xl">
            <Button component="a" href="/" size="lg">
              Sign In
            </Button>
          </Group>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="xl" py="md">
      {/* Newspaper Header */}
      <Paper p="xl" mb="lg" withBorder style={{ backgroundColor: '#f8f9fa' }}>
        <Group justify="space-between" align="center">
          <div>
            <Title order={1} style={{ fontFamily: 'Times New Roman, serif', fontSize: '2.5rem' }}>
              CodeWallet
            </Title>
            <Text size="sm" c="dimmed" style={{ fontStyle: 'italic' }}>
              Hotel Rate Finder & Corporate Discount Manager
            </Text>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Text size="xs" c="dimmed">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
            <Badge variant="light" size="sm" mt="xs">
              {session.user.email}
            </Badge>
          </div>
        </Group>
      </Paper>

      {/* Main Content Grid - Newspaper Style */}
      <Grid>
        {/* Left Column - Main Content */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper p="lg" withBorder mb="md">
            <Title order={2} mb="md" style={{ borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>
              Hotel Search
            </Title>
            <Text c="dimmed" mb="lg">
              Find the best hotel rates using your corporate discount codes
            </Text>
            
            <HotelSearchForm onSearchResults={setSearchResults} />
          </Paper>

          <Paper p="lg" withBorder>
            <Title order={2} mb="md" style={{ borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>
              Rate Comparison Results
            </Title>
            
            <RateComparison searchResults={searchResults} />
          </Paper>
        </Grid.Col>

        {/* Right Column - Sidebar */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          {/* Discount Codes Section */}
          <Paper p="lg" withBorder mb="md">
            <Title order={3} mb="md" style={{ borderBottom: '1px solid #dee2e6', paddingBottom: '0.5rem' }}>
              Your Discount Codes
            </Title>
            
            <DiscountCodeManager />
          </Paper>

          {/* Search History Section */}
          <Paper p="lg" withBorder mb="md">
            <Title order={3} mb="md" style={{ borderBottom: '1px solid #dee2e6', paddingBottom: '0.5rem' }}>
              Recent Searches
            </Title>
            
            <SearchHistory 
              onReSearch={(params) => {
                // This would ideally populate the search form with the params
                // For now, just trigger a new search
                console.log('Re-searching with params:', params);
              }}
            />
          </Paper>

          {/* AI Assistant Section */}
          <Paper p="lg" withBorder>
            <Title order={3} mb="md" style={{ borderBottom: '1px solid #dee2e6', paddingBottom: '0.5rem' }}>
              AI Assistant
            </Title>
            
            <Paper p="md" withBorder>
              <Text size="sm" fw={500} mb="xs">💡 Quick Tips</Text>
              <Stack gap="xs">
                <Text size="xs" c="dimmed">
                  • Use natural language: "cheap hotel in NYC this weekend"
                </Text>
                <Text size="xs" c="dimmed">
                  • Add multiple discount codes for better savings
                </Text>
                <Text size="xs" c="dimmed">
                  • Compare Hilton vs Marriott rates side by side
                </Text>
                <Text size="xs" c="dimmed">
                  • Click on previous searches to repeat them
                </Text>
              </Stack>
            </Paper>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Footer */}
      <Divider my="xl" />
      <Text ta="center" size="xs" c="dimmed">
        CodeWallet Hotel Rate Finder - Find the best corporate rates across Hilton and Marriott properties
      </Text>
    </Container>
  );
}

export default CodeWalletApp;