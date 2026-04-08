import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Switch,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface AvailabilitySlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export const AvailabilityScreen: React.FC = () => {
  const { user } = useAuth();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);
  const [formData, setFormData] = useState({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '17:00',
    is_active: true,
  });

  const fetchSlots = async () => {
    try {
      if (user?.id) {
        const response = await api.get(`/api/providers/${user.id}/availability-slots`);
        setSlots(response.data.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar disponibilidade:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSlots();
  };

  const handleAddSlot = async () => {
    if (!formData.start_time || !formData.end_time) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    try {
      if (editingSlot) {
        await api.put(`/api/availability-slots/${editingSlot.id}`, formData);
        Alert.alert('Sucesso', 'Horário atualizado');
      } else {
        await api.post(`/api/providers/${user?.id}/availability-slots`, formData);
        Alert.alert('Sucesso', 'Horário adicionado');
      }

      setFormData({ day_of_week: 1, start_time: '09:00', end_time: '17:00', is_active: true });
      setEditingSlot(null);
      setShowModal(false);
      fetchSlots();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o horário');
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    Alert.alert('Deletar Horário', 'Tem certeza que deseja deletar?', [
      { text: 'Não', onPress: () => {} },
      {
        text: 'Sim',
        onPress: async () => {
          try {
            await api.delete(`/api/availability-slots/${slotId}`);
            fetchSlots();
            Alert.alert('Sucesso', 'Horário deletado');
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível deletar o horário');
          }
        },
      },
    ]);
  };

  const handleEditSlot = (slot: AvailabilitySlot) => {
    setEditingSlot(slot);
    setFormData({
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      is_active: slot.is_active,
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  const slotsByDay = slots.reduce((acc, slot) => {
    if (!acc[slot.day_of_week]) {
      acc[slot.day_of_week] = [];
    }
    acc[slot.day_of_week].push(slot);
    return acc;
  }, {} as Record<number, AvailabilitySlot[]>);

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Disponibilidade</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setEditingSlot(null);
              setFormData({ day_of_week: 1, start_time: '09:00', end_time: '17:00', is_active: true });
              setShowModal(true);
            }}
          >
            <Text style={styles.addButtonText}>+ Adicionar</Text>
          </TouchableOpacity>
        </View>

        {slots.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum horário configurado</Text>
            <Text style={styles.emptySubtext}>Adicione seus horários de atendimento</Text>
          </View>
        ) : (
          <View style={styles.slotsContainer}>
            {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
              <View key={dayIndex} style={styles.daySection}>
                <Text style={styles.dayTitle}>{DAYS[dayIndex]}</Text>
                {slotsByDay[dayIndex] ? (
                  slotsByDay[dayIndex].map((slot) => (
                    <View key={slot.id} style={styles.slotCard}>
                      <View style={styles.slotInfo}>
                        <Text style={styles.slotTime}>
                          {slot.start_time} - {slot.end_time}
                        </Text>
                        <View style={[
                          styles.statusBadge,
                          { backgroundColor: slot.is_active ? '#22c55e' : '#ef4444' }
                        ]}>
                          <Text style={styles.statusText}>
                            {slot.is_active ? 'Ativo' : 'Inativo'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.slotActions}>
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() => handleEditSlot(slot)}
                        >
                          <Text style={styles.editButtonText}>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDeleteSlot(slot.id)}
                        >
                          <Text style={styles.deleteButtonText}>Deletar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noSlotText}>Sem horários</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingSlot ? 'Editar Horário' : 'Novo Horário'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form}>
              <Text style={styles.label}>Dia da Semana</Text>
              <View style={styles.daySelector}>
                {DAYS.map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayButton,
                      formData.day_of_week === index && styles.dayButtonActive
                    ]}
                    onPress={() => setFormData({ ...formData, day_of_week: index })}
                  >
                    <Text style={[
                      styles.dayButtonText,
                      formData.day_of_week === index && styles.dayButtonTextActive
                    ]}>
                      {day.substring(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Horário de Início</Text>
              <TextInput
                style={styles.input}
                placeholder="09:00"
                value={formData.start_time}
                onChangeText={(text) => setFormData({ ...formData, start_time: text })}
              />

              <Text style={styles.label}>Horário de Término</Text>
              <TextInput
                style={styles.input}
                placeholder="17:00"
                value={formData.end_time}
                onChangeText={(text) => setFormData({ ...formData, end_time: text })}
              />

              <View style={styles.switchContainer}>
                <Text style={styles.label}>Ativo</Text>
                <Switch
                  value={formData.is_active}
                  onValueChange={(value) => setFormData({ ...formData, is_active: value })}
                  trackColor={{ false: '#ccc', true: '#22c55e' }}
                  thumbColor={formData.is_active ? '#0a7ea4' : '#999'}
                />
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddSlot}
              >
                <Text style={styles.submitButtonText}>
                  {editingSlot ? 'Atualizar' : 'Adicionar'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 5,
  },
  slotsContainer: {
    padding: 15,
  },
  daySection: {
    marginBottom: 20,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  slotCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  slotInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  slotTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  slotActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#0a7ea4',
    fontSize: 11,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 11,
    fontWeight: '600',
  },
  noSlotText: {
    color: '#999',
    fontSize: 12,
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#999',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  daySelector: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  dayButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dayButtonActive: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
  },
  dayButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  dayButtonTextActive: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 15,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#0a7ea4',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
