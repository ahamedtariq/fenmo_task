import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Alert,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';

const CategoryManager = ({ categories, onCategoryAdded }) => {
  const [categoryName, setCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!categoryName.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      const url = editingCategory 
        ? `http://localhost:8000/update_categories/${editingCategory.id}`
        : 'http://localhost:8000/save_categories';
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category_name: categoryName.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to save category');
      }

      setCategoryName('');
      setEditingCategory(null);
      onCategoryAdded();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setCategoryName('');
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {editingCategory ? 'Edit Category' : 'Add New Category'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Category Name"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            type="submit"
            variant="contained"
            startIcon={<Add />}
            sx={{ flex: 1 }}
          >
            {editingCategory ? 'Update' : 'Add'} Category
          </Button>
          {editingCategory && (
            <Button
              variant="outlined"
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
          )}
        </Box>
      </Box>

      <Typography variant="subtitle1" gutterBottom>
        Existing Categories ({categories.length})
      </Typography>
      
      <Paper variant="outlined">
        <List sx={{ maxHeight: 300, overflow: 'auto' }}>
          {categories.length === 0 ? (
            <ListItem>
              <ListItemText primary="No categories found" />
            </ListItem>
          ) : (
            categories.map((category) => (
              <ListItem
                key={category.id}
                secondaryAction={
                  <IconButton edge="end" onClick={() => handleEdit(category)}>
                    <Edit />
                  </IconButton>
                }
              >
                <ListItemText primary={category.name} />
              </ListItem>
            ))
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default CategoryManager;