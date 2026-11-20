import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  SafeAreaView, 
  Alert 
} from 'react-native';

export default function TeacherSessionScreen({ route, navigation }) {
  const { materia, codigo } = route.params || { materia: 'Materia', codigo: '------' };

  const [turnos, setTurnos] = useState([
    { id: '1', numero: 1, estado: 'en_espera', tiempo: 'Hace 2 min' },
    { id: '2', numero: 2, estado: 'en_espera', tiempo: 'Hace 1 min' },
    { id: '3', numero: 3, estado: 'en_espera', tiempo: 'Justo ahora' },
  ]);

  const handleDarTurno = (id) => {
    setTurnos(prev =>
      prev.map(t => t.id === id ? { ...t, estado: 'participando' } : t)
    );
  };

  const handleQuitarTurno = (id, numero) => {
    Alert.alert(
      'Quitar Turno',
      `¿Deseas quitar el Turno #${numero} de la fila?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Quitar', 
          style: 'destructive',
          onPress: () => {
            setTurnos(prev => prev.filter(t => t.id !== id));
          }
        }
      ]
    );
  };

  const renderTurno = ({ item }) => {
    const esParticipando = item.estado === 'participando';

    return (
      <View style={[styles.turnoCard, esParticipando && styles.turnoActiveCard]}>
        <View style={styles.turnoHeader}>
          <View style={styles.badgeContainer}>
            <Text style={[styles.turnoBadge, esParticipando && styles.turnoActiveBadge]}>
              Turno #{item.numero}
            </Text>
          </View>

          <Text style={styles.tiempoText}>{item.tiempo}</Text>
        </View>

        <View style={styles.actionsContainer}>
          {!esParticipando ? (
            <TouchableOpacity 
              style={styles.primaryBtn} 
              onPress={() => handleDarTurno(item.id)}
            >
              <Text style={styles.primaryBtnText}>Dar Turno</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.activeStatusTag}>
              <Text style={styles.activeStatusText}>Hablando actualmente</Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.deleteBtn} 
            onPress={() => handleQuitarTurno(item.id, item.numero)}
          >
            <Text style={styles.deleteBtnText}>Quitar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <View style={styles.headerCard}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>Volver</Text>
          </TouchableOpacity>
          <Text style={styles.materiaTitle}>{materia}</Text>
          <Text style={styles.codigoSubtitle}>Código activo: <Text style={styles.codigoHighlight}>{codigo}</Text></Text>
        </View>

        <View style={styles.listContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Fila de Participación</Text>
            <Text style={styles.countBadge}>{turnos.length} en espera</Text>
          </View>

          {turnos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Fila vacía</Text>
              <Text style={styles.emptyText}>No hay alumnos solicitando la palabra en este momento.</Text>
            </View>
          ) : (
            <FlatList
              data={turnos}
              keyExtractor={(item) => item.id}
              renderItem={renderTurno}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  backButton: {
    marginBottom: 8,
  },
  backText: {
    color: '#D98A6C',
    fontSize: 14,
    fontWeight: '600',
  },
  materiaTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3D3531',
  },
  codigoSubtitle: {
    fontSize: 14,
    color: '#8A827A',
    marginTop: 2,
  },
  codigoHighlight: {
    fontWeight: 'bold',
    color: '#D98A6C',
  },
  listContainer: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3D3531',
  },
  countBadge: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A827A',
    backgroundColor: '#EFECE6',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  turnoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFECE6',
  },
  turnoActiveCard: {
    borderColor: '#D98A6C',
    borderWidth: 2,
    backgroundColor: '#FFFBF9',
  },
  turnoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  turnoBadge: {
    backgroundColor: '#3D3531',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  turnoActiveBadge: {
    backgroundColor: '#D98A6C',
  },
  anonimoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A827A',
  },
  tiempoText: {
    fontSize: 12,
    color: '#A09891',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: '#D98A6C',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  activeStatusTag: {
    backgroundColor: '#EFECE6',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  activeStatusText: {
    color: '#D98A6C',
    fontSize: 13,
    fontWeight: 'bold',
  },
  deleteBtn: {
    backgroundColor: '#EFECE6',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  deleteBtnText: {
    color: '#3D3531',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3D3531',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    color: '#8A827A',
    textAlign: 'center',
  },
});