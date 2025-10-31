import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import expenseService from '../src/services/api';

const formatCurrencyInput = (value: string) => {
  const numericValue = value.replace(/\D/g, '');
  const formatted = (Number(numericValue) / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  return formatted.replace('R$', '').trim();
};

const formatDateToBR = (value: string) => {
  // Remove tudo que não é número
  const cleaned = value.replace(/\D/g, '');

  // Limita no máximo a 8 números (DDMMYYYY)
  const limited = cleaned.slice(0, 8);

  // Aplica DD/MM/YYYY
  if (limited.length <= 2) return limited;
  if (limited.length <= 4) return limited.replace(/(\d{2})(\d{1,2})/, '$1/$2');
  return limited.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3');
};

const convertBRToISO = (value: string) => {
  const [dia, mes, ano] = value.split('/');
  return `${ano}-${mes}-${dia}`;
};

const getLocalISODate = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().split('T')[0];
};

export default function AddExpenseScreen() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(
    formatDateToBR(getLocalISODate().split('-').reverse().join(''))
  );  
  const [loading, setLoading] = useState(false);

  const categories = [
    'Alimentação','Transporte','Moradia','Saúde','Educação','Lazer','Outros'
  ];

  const handleSubmit = async () => {
    if (!description.trim()) return Alert.alert('Erro', 'Insira uma descrição');
    if (!amount) return Alert.alert('Erro', 'Insira um valor válido');
    if (!category) return Alert.alert('Erro', 'Selecione uma categoria');

    setLoading(true);

    try {
      await expenseService.createExpense({
        description: description.trim(),
        amount: parseFloat(amount.replace(/\./g, '').replace(',', '.')),
        category,
        date: convertBRToISO(date),
      });

      Alert.alert('Sucesso', 'Despesa adicionada com sucesso');
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Erro', 'Não foi possível adicionar a despesa');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (cat: string) => {
    const icons: any = {
      'Alimentação': 'fast-food','Transporte': 'car','Moradia': 'home',
      'Saúde': 'medical','Educação': 'school','Lazer': 'game-controller','Outros': 'ellipsis-horizontal',
    };
    return icons[cat] || 'cash';
  };

  const getCategoryColor = (cat: string) => {
    const colors: any = {
      'Alimentação': '#FF6B6B','Transporte': '#4ECDC4','Moradia': '#45B7D1',
      'Saúde': '#96CEB4','Educação': '#FFEAA7','Lazer': '#DFE6E9','Outros': '#A29BFE',
    };
    return colors[cat] || '#95A5A6';
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Adicionar Despesa', 
          headerStyle: { backgroundColor: '#3498db' }, 
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.content}>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ex: Almoço no restaurante"
              value={description} 
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Valor (R$)</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="numeric" 
              placeholder="0,00"
              value={amount} 
              onChangeText={(text) => setAmount(formatCurrencyInput(text))}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data</Text>
            <TextInput 
              style={styles.input} 
              placeholder="DD/MM/AAAA"
              keyboardType="numeric"
              value={date} 
              onChangeText={(text) => setDate(formatDateToBR(text))}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Categoria</Text>
            <View style={styles.categoriesContainer}>
              {categories.map((cat) => (
                <TouchableOpacity 
                  key={cat} 
                  style={[
                    styles.categoryButton, 
                    category === cat && styles.categoryButtonActive, 
                    { borderColor: getCategoryColor(cat) }
                  ]} 
                  onPress={() => setCategory(cat)}
                >
                  <Ionicons 
                    name={getCategoryIcon(cat)} 
                    size={20} 
                    color={category === cat ? '#FFF' : getCategoryColor(cat)}
                  />
                  <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Salvando...' : 'Salvar Despesa'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  content: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#dfe6e9',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 2,
    minWidth: 140,
  },
  categoryButtonActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  categoryTextActive: {
    color: '#FFF',
  },
  button: {
    backgroundColor: '#3498db',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});