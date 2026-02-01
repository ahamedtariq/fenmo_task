import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Box,
  Chip,
  Typography,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const ExpenseTable = ({ expenses, categories, onDelete, onUpdate, apiBaseUrl }) => {
  const [editingExpense, setEditingExpense] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteDialog, setDeleteDialog] = useState(null);

  const handleEditClick = (expense) => {
    setEditingExpense(expense);
    setEditForm({
      description: expense.description,
      amount: expense.amount.toString(),
      date: expense.date,
      category_id: expense.category_id,
    });
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/update_expense/${editingExpense.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editForm,
          amount: parseFloat(editForm.amount),
        }),
      });

      if (!response.ok) throw new Error('Failed to update expense');

      setEditingExpense(null);
      onUpdate();
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(deleteDialog);
      setDeleteDialog(null);
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const totalAmount = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1">
          Total Expenses: {expenses.length}
        </Typography>
        <Typography variant="h6" color="primary">
          Total: ${totalAmount.toFixed(2)}
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Category</strong></TableCell>
              <TableCell align="right"><strong>Amount</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No expenses found
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense) => (
                <TableRow key={expense.id} hover>
                  <TableCell>{formatDate(expense.date)}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>
                    <Chip 
                      label={expense.category_name} 
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" color="error" fontWeight="bold">
                      ${parseFloat(expense.amount).toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEditClick(expense)}
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteDialog(expense.id)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog open={!!editingExpense} onClose={() => setEditingExpense(null)}>
        <DialogTitle>Edit Expense</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Category"
            value={editForm.category_id || ''}
            onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })}
            margin="normal"
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Description"
            value={editForm.description || ''}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={editForm.amount || ''}
            onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Date"
            type="date"
            value={editForm.date || ''}
            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingExpense(null)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this expense?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExpenseTable;