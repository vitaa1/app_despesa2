import axios from 'axios';

// *** IMPORTANTE: TROQUE PELO IP DA SUA MÁQUINA NA REDE ***
const API_URL = 'http://localhost:3000/api/expenses';

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const expenseService = {

  // Buscar todas as despesas
  getAllExpenses: async () => {
    try {
      const response = await api.get('/');
      return response.data.expenses;
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
      throw error;
    }
  },

  // Buscar uma despesa por ID
  getExpenseById: async (id) => {
    try {
      const response = await api.get(`/${id}`);
      return response.data.expense;
    } catch (error) {
      console.error('Erro ao buscar despesa:', error);
      throw error;
    }
  },

  // Criar nova despesa
  createExpense: async (expenseData) => {
    try {
      const response = await api.post('/', expenseData);
      return response.data.expense;
    } catch (error) {
      console.error('Erro ao criar despesa:', error);
      throw error;
    }
  },

  // Atualizar despesa
  updateExpense: async (id, expenseData) => {
    try {
      const response = await api.put(`/${id}`, expenseData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar despesa:', error);
      throw error;
    }
  },

  // Deletar despesa
  deleteExpense: async (id) => {
    try {
      const response = await api.delete(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar despesa:', error);
      throw error;
    }
  },

  // Obter total de despesas
  getTotalExpenses: async () => {
    try {
      const response = await api.get('/stats/total');
      return response.data.total;
    } catch (error) {
      console.error('Erro ao buscar total:', error);
      throw error;
    }
  },

  // Obter despesas por categoria
  getExpensesByCategory: async () => {
    try {
      const response = await api.get('/stats/by-category');
      return response.data.categories;
    } catch (error) {
      console.error('Erro ao buscar por categoria:', error);
      throw error;
    }
  },
};

export default expenseService;
