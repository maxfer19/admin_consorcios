import React, {useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {useMatchesStore} from '@store/matchesStore';
import {MatchCard} from '@components/common/MatchCard';
import {Match} from '@types/index';

export const HomeScreen = ({navigation}: any) => {
  const {matches, isLoading, fetchMatches} = useMatchesStore();

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleRefresh = () => {
    fetchMatches();
  };

  const handleMatchPress = (match: Match) => {
    navigation.navigate('MatchDetail', {matchId: match.id});
  };

  const renderMatch = ({item}: {item: Match}) => (
    <MatchCard match={item} onPress={() => handleMatchPress(item)} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        No hay partidos disponibles en este momento
      </Text>
      <Text style={styles.emptySubtext}>
        Deslizá hacia abajo para actualizar
      </Text>
    </View>
  );

  if (isLoading && matches.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Partidos Disponibles</Text>
        <Text style={styles.headerSubtitle}>
          {matches.length} {matches.length === 1 ? 'partido' : 'partidos'}
        </Text>
      </View>

      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
