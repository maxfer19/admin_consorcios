import React from 'react';
import {View, Text, StyleSheet, ScrollView, Alert} from 'react-native';
import {useAuthStore} from '@store/authStore';
import {Button} from '@components/common/Button';

export const ProfileScreen = () => {
  const {user, logout} = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro que querés salir?', [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Salir',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.profile?.firstName?.charAt(0) || 'U'}
          </Text>
        </View>
        <Text style={styles.name}>
          {user?.profile?.firstName} {user?.profile?.lastName}
        </Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nivel</Text>
          <Text style={styles.infoValue}>
            {user?.profile?.level || 'No definido'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Partidos Jugados</Text>
          <Text style={styles.infoValue}>
            {user?.profile?.matchesPlayed || 0}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Rating</Text>
          <Text style={styles.infoValue}>
            ⭐ {user?.profile?.rating?.toFixed(1) || '0.0'}
          </Text>
        </View>

        {user?.profile?.city && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ciudad</Text>
            <Text style={styles.infoValue}>{user.profile.city}</Text>
          </View>
        )}

        {user?.profile?.phone && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Teléfono</Text>
            <Text style={styles.infoValue}>{user.profile.phone}</Text>
          </View>
        )}
      </View>

      {user?.profile?.bio && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bio</Text>
          <Text style={styles.bioText}>{user.profile.bio}</Text>
        </View>
      )}

      <View style={styles.actions}>
        <Button
          title="Cerrar Sesión"
          onPress={handleLogout}
          variant="outline"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
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
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  bioText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  actions: {
    padding: 20,
    marginTop: 12,
  },
});
