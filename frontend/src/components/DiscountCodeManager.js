import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  TextInput,
  Textarea,
  Group,
  Text,
  ActionIcon,
  Badge,
  Alert,
  LoadingOverlay,
  Stack
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconTrash, IconEdit, IconInfoCircle } from '@tabler/icons-react';

/**
 * Discount Code Manager Component
 * Manages user's corporate discount codes with CRUD operations
 */
function DiscountCodeManager() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpened, setModalOpened] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [error, setError] = useState(null);

  // Form for adding/editing codes
  const form = useForm({
    initialValues: {
      corporate_name: '',
      code_value: '',
      notes: ''
    },
    validate: {
      code_value: (value) => (!value ? 'Code value is required' : null),
    },
  });

  // Load discount codes on component mount
  useEffect(() => {
    loadDiscountCodes();
  }, []);

  /**
   * Load user's discount codes from API
   */
  const loadDiscountCodes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/discount-codes?user_id=default-user');
      
      if (!response.ok) {
        throw new Error('Failed to load discount codes');
      }
      
      const data = await response.json();
      setCodes(data);
    } catch (err) {
      console.error('Error loading discount codes:', err);
      setError('Failed to load discount codes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle form submission for adding/editing codes
   */
  const handleSubmit = async (values) => {
    try {
      setError(null);
      
      const url = editingCode 
        ? `/api/discount-codes/${editingCode.id}?user_id=default-user`
        : '/api/discount-codes?user_id=default-user';
      
      const method = editingCode ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to save discount code');
      }

      // Reload codes and close modal
      await loadDiscountCodes();
      handleCloseModal();
      
    } catch (err) {
      console.error('Error saving discount code:', err);
      setError('Failed to save discount code. Please try again.');
    }
  };

  /**
   * Delete a discount code
   */
  const handleDelete = async (codeId) => {
    if (!window.confirm('Are you sure you want to delete this discount code?')) {
      return;
    }

    try {
      setError(null);
      
      const response = await fetch(`/api/discount-codes/${codeId}?user_id=default-user`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete discount code');
      }

      // Reload codes
      await loadDiscountCodes();
      
    } catch (err) {
      console.error('Error deleting discount code:', err);
      setError('Failed to delete discount code. Please try again.');
    }
  };

  /**
   * Open modal for adding new code
   */
  const handleAddNew = () => {
    setEditingCode(null);
    form.reset();
    setModalOpened(true);
  };

  /**
   * Open modal for editing existing code
   */
  const handleEdit = (code) => {
    setEditingCode(code);
    form.setValues({
      corporate_name: code.corporate_name || '',
      code_value: code.code_value || '',
      notes: code.notes || ''
    });
    setModalOpened(true);
  };

  /**
   * Close modal and reset form
   */
  const handleCloseModal = () => {
    setModalOpened(false);
    setEditingCode(null);
    form.reset();
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} />
      
      {/* Header */}
      <Group justify="space-between" mb="md">
        <div>
          <Text size="lg" fw={600}>Discount Codes</Text>
          <Text size="sm" c="dimmed">Manage your corporate hotel discount codes</Text>
        </div>
        <Button 
          leftSection={<IconPlus size={16} />}
          onClick={handleAddNew}
          size="sm"
        >
          Add Code
        </Button>
      </Group>

      {/* Error Alert */}
      {error && (
        <Alert 
          icon={<IconInfoCircle size={16} />} 
          color="red" 
          mb="md"
          onClose={() => setError(null)}
          withCloseButton
        >
          {error}
        </Alert>
      )}

      {/* Codes Table */}
      {codes.length === 0 && !loading ? (
        <Text ta="center" c="dimmed" py="xl">
          No discount codes yet. Add your first corporate code to get started!
        </Text>
      ) : (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Company</Table.Th>
              <Table.Th>Code</Table.Th>
              <Table.Th>Notes</Table.Th>
              <Table.Th>Added</Table.Th>
              <Table.Th width={100}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {codes.map((code) => (
              <Table.Tr key={code.id}>
                <Table.Td>
                  {code.corporate_name ? (
                    <Badge variant="light" size="sm">
                      {code.corporate_name}
                    </Badge>
                  ) : (
                    <Text c="dimmed" size="sm">-</Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Text ff="monospace" fw={500}>
                    {code.code_value}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" lineClamp={2}>
                    {code.notes || '-'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {formatDate(code.created_at)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      onClick={() => handleEdit(code)}
                      size="sm"
                    >
                      <IconEdit size={14} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => handleDelete(code.id)}
                      size="sm"
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      {/* Add/Edit Modal */}
      <Modal
        opened={modalOpened}
        onClose={handleCloseModal}
        title={editingCode ? 'Edit Discount Code' : 'Add Discount Code'}
        size="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Corporate Name"
              placeholder="e.g., GE, IBM, Pfizer"
              {...form.getInputProps('corporate_name')}
            />
            
            <TextInput
              label="Discount Code"
              placeholder="e.g., 0001398, N9880578"
              required
              {...form.getInputProps('code_value')}
            />
            
            <Textarea
              label="Notes"
              placeholder="Optional notes about this code..."
              rows={3}
              {...form.getInputProps('notes')}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit">
                {editingCode ? 'Update Code' : 'Add Code'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </div>
  );
}

export default DiscountCodeManager;