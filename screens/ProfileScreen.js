import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Modal } from 'react-native';
import { UserContext } from '../context/UserContext';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({ setIsLoggedIn }) {
  const { user, setUser } = useContext(UserContext);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [skills, setSkills] = useState(user.skills?.join(', ') || '');
  const [interests, setInterests] = useState(user.interests?.join(', ') || '');

  const handleLogout = () => {
    if (setIsLoggedIn) {
      setIsLoggedIn(false);
    }
  };

  const updateProfile = () => {
    setUser({
      ...user,
      skills: skills.split(',').map(s => s.trim()),
      interests: interests.split(',').map(i => i.trim()),
    });
    setEditModalVisible(false);
    alert('Profile updated successfully!');
  };

  const stats = [
    { label: 'Projects', value: '3', icon: 'folder-open' },
    { label: 'Hackathons', value: '2', icon: 'trophy' },
    { label: 'Connections', value: user.connections?.length || 0, icon: 'people' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{user.email?.charAt(0).toUpperCase() || 'U'}</Text>
        </View>
        <Text style={styles.name}>{user.email?.split('@')[0] || 'User'}</Text>
        <Text style={styles.email}>{user.email || 'Not set'}</Text>
        
        <TouchableOpacity style={styles.editButton} onPress={() => setEditModalVisible(true)}>
          <Ionicons name="create-outline" size={18} color="#A30000" />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <Ionicons name={stat.icon} size={24} color="#A30000" />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.skillsContainer}>
          {user.skills?.map((skill) => (
            <View key={skill} style={styles.skillBadge}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
          {(!user.skills || user.skills.length === 0) && (
            <Text style={styles.emptyText}>No skills added yet</Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interests</Text>
        <View style={styles.skillsContainer}>
          {user.interests?.map((interest) => (
            <View key={interest} style={styles.interestBadge}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
          {(!user.interests || user.interests.length === 0) && (
            <Text style={styles.emptyText}>No interests added yet</Text>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Skills (comma separated)</Text>
            <TextInput
              style={styles.input}
              placeholder="React, Node.js, Python"
              placeholderTextColor="#9CA3AF"
              value={skills}
              onChangeText={setSkills}
            />

            <Text style={styles.inputLabel}>Interests (comma separated)</Text>
            <TextInput
              style={styles.input}
              placeholder="AI, Web Development, Design"
              placeholderTextColor="#9CA3AF"
              value={interests}
              onChangeText={setInterests}
            />

            <TouchableOpacity style={styles.saveButton} onPress={updateProfile}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { alignItems: 'center', backgroundColor: '#FFFFFF', paddingVertical: 32, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#A30000', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: '#FFFFFF' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  email: { fontSize: 14, color: '#6B7280', marginBottom: 16 },
  editButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#FEF2F2' },
  editButtonText: { fontSize: 14, color: '#A30000', fontWeight: '600' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: 20, backgroundColor: '#FFFFFF', marginTop: 1 },
  statCard: { alignItems: 'center', gap: 8 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  statLabel: { fontSize: 12, color: '#6B7280' },
  section: { backgroundColor: '#FFFFFF', marginTop: 12, padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12 },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillBadge: { backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  skillText: { fontSize: 14, color: '#A30000', fontWeight: '500' },
  interestBadge: { backgroundColor: '#F0FDF4', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  interestText: { fontSize: 14, color: '#10B981', fontWeight: '500' },
  emptyText: { fontSize: 14, color: '#9CA3AF', fontStyle: 'italic' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#A30000', margin: 20, paddingVertical: 14, borderRadius: 12 },
  logoutButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, width: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  inputLabel: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, fontSize: 16, color: '#111827', marginBottom: 20, backgroundColor: '#F9FAFB' },
  saveButton: { backgroundColor: '#A30000', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});