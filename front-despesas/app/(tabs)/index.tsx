import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import expenseService from '../../src/services/api';

export default function HomeScreen() {
  const router = useRouter();
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadExpenses = async (isRefreshing = false) => {
    try {
      const data = await expenseService.getAllExpenses();
      setExpenses(data);

      const total = await expenseService.getTotalExpenses();
      setTotalExpenses(total);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as despesas');
    } finally {
      if (isRefreshing) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadExpenses(true);
  };

const handleDelete = (id: number) => {
  if (Platform.OS === 'web') {
    const ok = typeof window !== 'undefined' && window.confirm('Você realmente deseja excluir esta despesa?');
    if (!ok) return;

    (async () => {
      try {
        await expenseService.deleteExpense(id);
        await loadExpenses(); // Recarrega lista
        // No web, use alert simples ou um toast da sua UI lib
        alert('Despesa excluída com sucesso!');
      } catch (error) {
        alert('Não foi possível excluir a despesa.');
        console.error(error);
      }
    })();
    return;
  }

  // Android/iOS: mantém Alert com botões
  Alert.alert(
    'Confirmar Exclusão',
    'Você realmente deseja excluir esta despesa?',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await expenseService.deleteExpense(id);
            await loadExpenses();
            Alert.alert('Sucesso', 'Despesa excluída com sucesso!');
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível excluir a despesa.');
          }
        },
      },
    ]
  );
};

  const handleEdit = (expense: any) => {
    router.push({
      pathname: '/edit-expense',
      params: { expense: JSON.stringify(expense) },
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
  if (!dateString) return '';
  
  const [pureDate] = dateString.split('T');
  const [year, month, day] = pureDate.split('-');

  return `${day}/${month}/${year}`;
};

  const getCategoryIcon = (category: string) => {
    const icons: any = {
      'Alimentação': 'fast-food',
      'Transporte': 'car',
      'Moradia': 'home',
      'Saúde': 'medical',
      'Educação': 'school',
      'Lazer': 'game-controller',
      'Outros': 'ellipsis-horizontal',
    };
    return icons[category] || 'cash';
  };

  const getCategoryColor = (category: string) => {
    const colors: any = {
      'Alimentação': '#FF6B6B',
      'Transporte': '#4ECDC4',
      'Moradia': '#45B7D1',
      'Saúde': '#96CEB4',
      'Educação': '#FFEAA7',
      'Lazer': '#DFE6E9',
      'Outros': '#A29BFE',
    };
    return colors[category] || '#95A5A6';
  };

  const renderExpenseCard = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.leftSection}>
        <View style={[styles.iconContainer, { backgroundColor: getCategoryColor(item.category) }]}>
          <Ionicons name={getCategoryIcon(item.category)} size={24} color="#FFF" />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.date}>{formatDate(item.date)}</Text>
        </View>
      </View>
      <View style={styles.rightSection}>
        <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}>
            <Ionicons name="create-outline" size={20} color="#3498db" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionButton}> 
            <Ionicons name="trash-outline" size={20} color="#e74c3c" /> 
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Carregando despesas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total de Despesas</Text>
          <Text style={styles.totalAmount}>{formatCurrency(totalExpenses)}</Text>
        </View>
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderExpenseCard}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={expenses.length === 0 && styles.emptyList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={80} color="#bdc3c7" />
            <Text style={styles.emptyText}>Nenhuma despesa cadastrada</Text>
            <Text style={styles.emptySubtext}>Clique no botão + para adicionar</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/add-expense')}>
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
  header: {
    backgroundColor: '#3498db',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  totalContainer: {
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: '#ecf0f1',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 8,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#95a5a6',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 10,
    padding: 5,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#3498db',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});