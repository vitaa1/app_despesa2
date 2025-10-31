import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import {expenseService} from '../src/services/api';

const formatCurrencyInput = (value: string) => {
  const numericValue = value.replace(/\D/g, '');
  const formatted = (Number(numericValue) / 100).toLocaleString('pt-BR', {
    style: 'currency', currency: 'BRL',
  });
  return formatted.replace('R$', '').trim();
};

const formatDateToBR = (value: string) => {
  const cleaned = value.replace(/\D/g, '');
  const limited = cleaned.slice(0, 8);
  if (limited.length <= 2) return limited;
  if (limited.length <= 4) return limited.replace(/(\d{2})(\d{1,2})/, '$1/$2');
  return limited.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3');
};

const convertBRToISO = (value: string) => {
  const [dia, mes, ano] = value.split('/');
  return `${ano}-${mes}-${dia}`;
};

export default function EditExpenseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const expense = JSON.parse(params.expense as string);

  const [description, setDescription] = useState(expense.description);
  const [amount, setAmount] = useState(
  expense.amount
    .toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .replace('R$', '')
);

  const [category, setCategory] = useState(expense.category);
  const formatISOToBR = (isoDate: string) => {
  const [dateOnly] = isoDate.split('T'); // Remove hora
  const [year, month, day] = dateOnly.split('-');
  return `${day}/${month}/${year}`;
};

const [date, setDate] = useState(formatISOToBR(expense.date));

  const [loading, setLoading] = useState(false);

  const categories = ['Alimentação','Transporte','Moradia','Saúde','Educação','Lazer','Outros'];

  const handleUpdate = async () => {
    if (!description.trim()) return Alert.alert('Erro', 'Insira uma descrição');
    if (!amount) return Alert.alert('Erro', 'Insira um valor válido');
    if (!category) return Alert.alert('Erro', 'Selecione uma categoria');

    setLoading(true);

    try {
      await expenseService.updateExpense(expense.id, {
        description: description.trim(),
        amount: parseFloat(amount.replace(/\./g, '').replace(',', '.')),
        category,
        date: convertBRToISO(date),
      });

      Alert.alert('Sucesso', 'Despesa atualizada com sucesso');
      router.replace('/(tabs)');

    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar a despesa');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (cat: string) => ({
    'Alimentação': 'fast-food','Transporte': 'car','Moradia': 'home','Saúde': 'medical',
    'Educação': 'school','Lazer': 'game-controller','Outros': 'ellipsis-horizontal',
  }[cat] || 'cash');

  const getCategoryColor = (cat: string) => ({
    'Alimentação': '#FF6B6B','Transporte': '#4ECDC4','Moradia': '#45B7D1',
    'Saúde': '#96CEB4','Educação': '#FFEAA7','Lazer': '#DFE6E9','Outros': '#A29BFE',
  }[cat] || '#95A5A6');

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Editar Despesa', 
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

          <View>
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
            onPress={handleUpdate}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Atualizando...' : 'Atualizar Despesa'}
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