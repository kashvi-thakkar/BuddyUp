import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { users } from '../data/users';
import { rankUsers } from '../utils/recommendation';
import { isFakeProfile } from '../utils/fakeDetection';
import { UserContext } from '../context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import LogoHeader from '../components/LogoHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DiscoveryScreen = ({ navigation }) => {
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [connecting, setConnecting] = useState(null);
  const { user, setUser } = useContext(UserContext);

  const currentUser = {
    skills: user.skills || ['React', 'JavaScript'],
    availability: 'Evenings',
    interests: user.interests || ['AI', 'Development'],
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setLoading(true);
    const clean = users.filter(u => !isFakeProfile(u));
    const ranked = rankUsers(clean, currentUser);
    setFilteredUsers(ranked);
    setLoading(false);
  };

  const handleConnect = async (person) => {
    if (user.connections?.includes(person.id)) {
      Alert.alert('Already Connected', `You are already connected with ${person.name}`);
      return;
    }

    setConnecting(person.id);
    
    // Simulate connection request
    setTimeout(() => {
      const updatedConnections = [...(user.connections || []), person.id];
      setUser({
        ...user,
        connections: updatedConnections,
      });
      
      Alert.alert(
        'Connection Request Sent!',
        `Connection request sent to ${person.name}. They will be notified.`,
        [{ text: 'OK' }]
      );
      setConnecting(null);
    }, 1000);
  };

  const handleLogout = async () => {
    try {
      // Clear all stored data
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('likedPosts');
      await AsyncStorage.removeItem('comments');
      await AsyncStorage.removeItem('messages');
      
      // Reset user context
      setUser({ email: '', skills: [], interests: [], connections: [] });
      
      // Navigate to login
      navigation.replace('Login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };


  const getMatchLevel = (score) => {
    if (score >= 15) return { level: 'Excellent Match', color: '#10B981', icon: 'star', emoji: '🔥' };
    if (score >= 10) return { level: 'Good Match', color: '#F59E0B', icon: 'thumbs-up', emoji: '👍' };
    return { level: 'Potential Match', color: '#6B7280', icon: 'hand', emoji: '👋' };
  };

  const renderUserCard = ({ item }) => {
    const matchInfo = getMatchLevel(item.score);
    const isConnected = user.connections?.includes(item.id);
    const isConnecting = connecting === item.id;
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.name}>{item.name}</Text>
            <View style={styles.availabilityBadge}>
              <Ionicons name="time-outline" size={12} color="#6B7280" />
              <Text style={styles.availabilityText}>{item.availability}</Text>
            </View>
          </View>
          {item.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>

        {item.description ? (
          <Text style={styles.description}>{item.description}</Text>
        ) : null}

        <View style={styles.skillsContainer}>
          {item.skills.map((skill) => (
            <View key={skill} style={styles.skillBadge}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Ionicons name="folder-open" size={14} color="#6B7280" />
            <Text style={styles.statText}>{item.projectsCompleted} Projects</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="trophy" size={14} color="#6B7280" />
            <Text style={styles.statText}>{item.hackathons} Hackathons</Text>
          </View>
        </View>

        <View style={styles.matchContainer}>
          <Text style={styles.matchEmoji}>{matchInfo.emoji}</Text>
          <Text style={[styles.matchText, { color: matchInfo.color }]}>
            {matchInfo.level} • Score: {item.score}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.button, 
            isConnected && styles.buttonDisabled,
            isConnecting && styles.buttonConnecting
          ]}
          onPress={() => handleConnect(item)}
          disabled={isConnected || isConnecting}
        >
          <Text style={styles.buttonText}>
            {isConnecting ? 'Sending...' : (isConnected ? 'Connected ✓' : 'Connect')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LogoHeader screenName="DiscoveryScreen" onLogout={handleLogout} navigation={navigation} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover Peers</Text>
        <Text style={styles.headerSubtitle}>Find your perfect collaboration partner</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or skills..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A30000" />
          <Text style={styles.loadingText}>Finding your best matches...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers.filter(u => 
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
          )}
          keyExtractor={(item) => item.id}
          renderItem={renderUserCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 16, 
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#111827' 
  },
  headerSubtitle: { 
    fontSize: 14, 
    color: '#6B7280', 
    marginTop: 4 
  },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginHorizontal: 20, 
    marginTop: 16, 
    marginBottom: 16, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    paddingHorizontal: 12 
  },
  searchIcon: { 
    marginRight: 8 
  },
  searchInput: { 
    flex: 1, 
    paddingVertical: 12, 
    fontSize: 16, 
    color: '#111827' 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: { 
    marginTop: 12, 
    color: '#6B7280', 
    fontSize: 14 
  },
  listContainer: { 
    padding: 16, 
    paddingTop: 0 
  },
  card: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 16, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 8, 
    elevation: 3 
  },
  cardHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  avatarContainer: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    backgroundColor: '#A30000', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12 
  },
  avatarText: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#FFFFFF' 
  },
  userInfo: { 
    flex: 1 
  },
  name: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#111827', 
    marginBottom: 4 
  },
  availabilityBadge: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  availabilityText: { 
    fontSize: 12, 
    color: '#6B7280', 
    marginLeft: 4 
  },
  verifiedBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F0FDF4', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12 
  },
  verifiedText: { 
    fontSize: 11, 
    color: '#10B981', 
    marginLeft: 4, 
    fontWeight: '500' 
  },
  description: { 
    fontSize: 14, 
    color: '#4B5563', 
    marginBottom: 12, 
    lineHeight: 20 
  },
  skillsContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginBottom: 12 
  },
  skillBadge: { 
    backgroundColor: '#F3F4F6', 
    borderRadius: 8, 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    marginRight: 8, 
    marginBottom: 8 
  },
  skillText: { 
    fontSize: 12, 
    color: '#374151', 
    fontWeight: '500' 
  },
  statsContainer: { 
    flexDirection: 'row', 
    marginBottom: 12, 
    gap: 16 
  },
  stat: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  statText: { 
    fontSize: 12, 
    color: '#6B7280', 
    marginLeft: 4 
  },
  matchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12, 
    paddingTop: 8, 
    borderTopWidth: 1, 
    borderTopColor: '#F3F4F6' 
  },
  matchEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  matchText: { 
    fontSize: 12, 
    fontWeight: '500' 
  },
  button: { 
    backgroundColor: '#A30000', 
    paddingVertical: 10, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  buttonDisabled: { 
    backgroundColor: '#E5E7EB' 
  },
  buttonConnecting: {
    backgroundColor: '#F59E0B',
  },
  buttonText: { 
    color: '#FFFFFF', 
    fontWeight: '600', 
    fontSize: 14 
  },
});

export default DiscoveryScreen;