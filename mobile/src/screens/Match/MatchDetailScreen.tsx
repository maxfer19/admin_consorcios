import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useMatchesStore} from '@store/matchesStore';
import {useAuthStore} from '@store/authStore';
import {Button} from '@components/common/Button';

export const MatchDetailScreen = ({route, navigation}: any) => {
  const {matchId} = route.params;
  const {currentMatch, isLoading, fetchMatch, joinMatch, leaveMatch} =
    useMatchesStore();
  const {user} = useAuthStore();

  useEffect(() => {
    fetchMatch(matchId);
  }, [matchId]);

  if (isLoading || !currentMatch) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const isOrganizer = currentMatch.organizerId === user?.id;
  const isPlayer = currentMatch.players?.some(p => p.userId === user?.id);
  const canJoin = !isPlayer && currentMatch.spotsAvailable > 0;

  const handleJoin = async () => {
    try {
      await joinMatch(matchId);
      Alert.alert('¡Éxito!', 'Te uniste al partido');
    } catch (err) {
      // Error handled by store
    }
  };

  const handleLeave = async () => {
    Alert.alert(
      'Salir del Partido',
      '¿Estás seguro que querés salir de este partido?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveMatch(matchId);
              Alert.alert('Éxito', 'Saliste del partido');
            } catch (err) {
              // Error handled by store
            }
          },
        },
      ],
    );
  };

  const startTime = new Date(currentMatch.timeSlot?.startTime || '');
  const endTime = new Date(currentMatch.timeSlot?.endTime || '');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.courtName}>
          🎾 {currentMatch.timeSlot?.court?.name}
        </Text>
        <Text style={styles.price}>${currentMatch.timeSlot?.price}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Ubicación</Text>
        <Text style={styles.address}>
          {currentMatch.timeSlot?.court?.address}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🕐 Horario</Text>
        <Text style={styles.text}>
          {startTime.toLocaleDateString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
        <Text style={styles.text}>
          {startTime.toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
          })}{' '}
          -{' '}
          {endTime.toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏆 Nivel</Text>
        <Text style={styles.text}>
          {currentMatch.requiredLevel || 'Todos los niveles'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👥 Jugadores ({4 - currentMatch.spotsAvailable}/4)</Text>
        {currentMatch.players?.map(player => (
          <View key={player.id} style={styles.playerCard}>
            <Text style={styles.playerName}>
              {player.user?.profile?.firstName}{' '}
              {player.user?.profile?.lastName}
              {player.userId === currentMatch.organizerId && ' (Organizador)'}
            </Text>
            <Text style={styles.playerLevel}>
              Nivel: {player.user?.profile?.level || 'N/A'}
            </Text>
          </View>
        ))}
      </View>

      {currentMatch.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Notas</Text>
          <Text style={styles.text}>{currentMatch.notes}</Text>
        </View>
      )}

      <View style={styles.amenitiesSection}>
        <Text style={styles.sectionTitle}>✨ Servicios</Text>
        <View style={styles.amenitiesGrid}>
          {currentMatch.timeSlot?.court?.amenities.map((amenity, index) => (
            <Text key={index} style={styles.amenity}>
              • {amenity}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        {canJoin && (
          <Button
            title="Unirse al Partido"
            onPress={handleJoin}
            loading={isLoading}
          />
        )}

        {isPlayer && !isOrganizer && (
          <Button
            title="Salir del Partido"
            onPress={handleLeave}
            variant="outline"
            loading={isLoading}
          />
        )}

        {isOrganizer && (
          <Text style={styles.organizerText}>
            Sos el organizador de este partido
          </Text>
        )}

        {!canJoin && !isPlayer && (
          <Text style={styles.fullText}>Partido Completo</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courtName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#34C759',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  address: {
    fontSize: 16,
    color: '#666',
  },
  playerCard: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  playerLevel: {
    fontSize: 14,
    color: '#666',
  },
  amenitiesSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: 12,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenity: {
    fontSize: 14,
    color: '#666',
    width: '50%',
    marginBottom: 8,
  },
  actions: {
    padding: 20,
    marginTop: 12,
  },
  organizerText: {
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  fullText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    fontWeight: '600',
  },
});
