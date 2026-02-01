import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Alert,
  Grid,
} from '@mui/material';
import { Add } from '@mui/icons-material';

const ExpenseForm = ({ categories, onExpenseAdded }) => {
  const [formData, setFormData] = useState({
    category_id: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.category_id) {
      setError('Please select a category');
      setLoading(false);
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      setLoading(false);
      return;
    }
    if (!formData.date) {
      setError('Please select a date');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to save expense');
      }

      // Reset form
      setFormData({
        category_id: '',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
      });

      onExpenseAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Add New Expense
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Category"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
              size="small"
            >
              <MenuItem value="">
                <em>Select Category</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              required
              size="small"
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              size="small"
              multiline
              rows={2}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Add />}
              disabled={loading}
              fullWidth
              sx={{ mt: 1 }}
            >
              {loading ? 'Adding...' : 'Add Expense'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ExpenseForm;