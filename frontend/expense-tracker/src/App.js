import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import CategoryManager from './components/CategoryManager';
import ExpenseForm from './components/ExpenseForm';
import ExpenseTable from './components/ExpenseTable';
import './styles.css';

const API_BASE_URL = 'http://localhost:8000'; // Change this to your FastAPI server URL

function App() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  // Fetch expenses
  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category_id', selectedCategory);
      if (sortOrder) params.append('sort', sortOrder);
      
      const response = await fetch(`${API_BASE_URL}/expenses?${params}`);
      if (!response.ok) throw new Error('Failed to fetch expenses');
      const data = await response.json();
      setExpenses(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCategories();
    fetchExpenses();
  }, [selectedCategory, sortOrder]);

  const handleExpenseAdded = () => {
    fetchExpenses();
    setSuccessMessage('Expense added successfully!');
  };

  const handleCategoryAdded = () => {
    fetchCategories();
    setSuccessMessage('Category added successfully!');
  };

  const handleDeleteExpense = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete expense');
      setSuccessMessage('Expense deleted successfully!');
      fetchExpenses();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
        Expense Tracker
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Column: Category Management */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <CategoryManager
              categories={categories}
              onCategoryAdded={handleCategoryAdded}
            />
          </Paper>
        </Grid>

        {/* Right Column: Expense Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <ExpenseForm
              categories={categories}
              onExpenseAdded={handleExpenseAdded}
            />
          </Paper>
        </Grid>

        {/* Full Width: Expense Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5">Expenses</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ padding: '8px', borderRadius: '4px' }}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  style={{ padding: '8px', borderRadius: '4px' }}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <ExpenseTable
                expenses={expenses}
                categories={categories}
                onDelete={handleDeleteExpense}
                onUpdate={() => fetchExpenses()}
                apiBaseUrl={API_BASE_URL}
              />
            )}
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        message={successMessage}
      />
    </Container>
  );
}

export default App;