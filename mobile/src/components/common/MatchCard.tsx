import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Match} from '@types/index';

interface MatchCardProps {
  match: Match;
  onPress: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({match, onPress}) => {
  const courtName = match.timeSlot?.court?.name || 'Cancha';
  const address = match.timeSlot?.court?.address || '';
  const price = match.timeSlot?.price || 0;
  const startTime = new Date(match.timeSlot?.startTime || '');
  const totalPlayers = 4 - match.spotsAvailable;
  const organizerName =
    match.organizer?.profile?.firstName +
    ' ' +
    match.organizer?.profile?.lastName;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.courtName}>🎾 {courtName}</Text>
        <Text style={styles.price}>${price}</Text>
      </View>

      <Text style={styles.address}>{address}</Text>

      <View style={styles.info}>
        <Text style={styles.time}>
          {startTime.toLocaleDateString()} - {startTime.toLocaleTimeString()}
        </Text>
        <Text style={styles.level}>
          Nivel: {match.requiredLevel || 'Todos'}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.organizer}>Organizador: {organizerName}</Text>
        <Text style={styles.players}>
          {totalPlayers}/4 jugadores ⭐⭐⭐
        </Text>
      </View>

      <View style={styles.spotsContainer}>
        <Text
          style={[
            styles.spotsText,
            match.spotsAvailable === 0 && styles.fullText,
          ]}>
          {match.spotsAvailable > 0
            ? `${match.spotsAvailable} ${
                match.spotsAvailable === 1 ? 'lugar' : 'lugares'
              } disponible${match.spotsAvailable > 1 ? 's' : ''}`
            : 'Completo'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  courtName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#34C759',
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  info: {
    marginBottom: 12,
  },
  time: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  level: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
    marginBottom: 8,
  },
  organizer: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  players: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  spotsContainer: {
    marginTop: 8,
  },
  spotsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
  },
  fullText: {
    color: '#FF3B30',
  },
});
