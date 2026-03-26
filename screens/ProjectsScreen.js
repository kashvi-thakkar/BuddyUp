import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Modal, Alert } from 'react-native';
import { projects } from '../data/projects';
import { Ionicons } from '@expo/vector-icons';
import LogoHeader from '../components/LogoHeader';
import { UserContext } from '../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProjectsScreen({ navigation }) {
  const [projectList, setProjectList] = useState(projects);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const { user, setUser } = useContext(UserContext);

  const createProject = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a project title');
      return;
    }

    const newProject = {
      id: Date.now().toString(),
      title,
      description,
      requiredSkills: skills.split(',').map(s => s.trim()),
      members: [user.email?.split('@')[0] || 'You'],
      createdAt: new Date().toISOString(),
      status: 'open',
    };

    setProjectList([newProject, ...projectList]);
    setTitle('');
    setDescription('');
    setSkills('');
    setModalVisible(false);
    Alert.alert('Success', 'Project created successfully!');
  };

  const handleInvite = (project) => {
    setSelectedProject(project);
    setInviteModalVisible(true);
  };

  const sendInvite = () => {
    Alert.alert(
      'Invitation Sent',
      `Invitation sent to your connections for ${selectedProject?.title}`,
      [{ text: 'OK' }]
    );
    setInviteModalVisible(false);
  };

  const handleJoinProject = (project) => {
    if (project.members.includes(user.email?.split('@')[0] || 'You')) {
      Alert.alert('Already Joined', 'You are already a member of this project');
      return;
    }
    
    Alert.alert(
      'Join Project',
      `Do you want to join "${project.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Join',
          onPress: () => {
            const updatedProjects = projectList.map(p =>
              p.id === project.id
                ? { ...p, members: [...p.members, user.email?.split('@')[0] || 'You'] }
                : p
            );
            setProjectList(updatedProjects);
            Alert.alert('Success', `You joined ${project.title}!`);
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
  try {
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('likedPosts');
    await AsyncStorage.removeItem('comments');
    await AsyncStorage.removeItem('messages');
    setUser({ email: '', skills: [], interests: [], connections: [] });
    navigation.replace('Login');
  } catch (error) {
    Alert.alert('Error', 'Failed to logout. Please try again.');
  }
};

  const renderProject = ({ item }) => {
    const isMember = item.members.includes(user.email?.split('@')[0] || 'You');
    
    return (
      <View style={styles.projectCard}>
        <View style={styles.projectHeader}>
          <Text style={styles.projectTitle}>{item.title}</Text>
          <View style={[styles.statusBadge, item.status === 'open' ? styles.statusOpen : styles.statusClosed]}>
            <Text style={styles.statusText}>{item.status === 'open' ? 'Open' : 'Closed'}</Text>
          </View>
        </View>

        {item.description && (
          <Text style={styles.projectDescription}>{item.description}</Text>
        )}

        <View style={styles.skillsContainer}>
          {item.requiredSkills?.map((skill) => (
            <View key={skill} style={styles.skillBadge}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>

        <View style={styles.projectFooter}>
          <View style={styles.membersContainer}>
            <Ionicons name="people" size={14} color="#6B7280" />
            <Text style={styles.membersText}>{item.members?.length || 0} members</Text>
          </View>
          
          {isMember ? (
            <View style={styles.memberBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <Text style={styles.memberBadgeText}>Member</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.joinButton} onPress={() => handleJoinProject(item)}>
              <Text style={styles.joinButtonText}>Join Project</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity style={styles.inviteButton} onPress={() => handleInvite(item)}>
          <Ionicons name="mail-outline" size={16} color="#A30000" />
          <Text style={styles.inviteButtonText}>Invite Connections</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LogoHeader screenName="ProjectsScreen" onLogout={handleLogout} navigation={navigation} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Projects</Text>
        <Text style={styles.headerSubtitle}>Collaborate on amazing ideas</Text>
      </View>

      <TouchableOpacity style={styles.createButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="add-circle" size={24} color="#A30000" />
        <Text style={styles.createButtonText}>Create New Project</Text>
      </TouchableOpacity>

      <FlatList
        data={projectList}
        keyExtractor={(item) => item.id}
        renderItem={renderProject}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      {/* Create Project Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Project</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Project Title"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Project Description"
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            <TextInput
              style={styles.input}
              placeholder="Required Skills (comma separated)"
              placeholderTextColor="#9CA3AF"
              value={skills}
              onChangeText={setSkills}
            />

            <TouchableOpacity style={styles.submitButton} onPress={createProject}>
              <Text style={styles.submitButtonText}>Create Project</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Invite Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={inviteModalVisible}
        onRequestClose={() => setInviteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invite Connections</Text>
              <TouchableOpacity onPress={() => setInviteModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>Invite your connections to join {selectedProject?.title}</Text>
            
            <View style={styles.connectionsList}>
              <Text style={styles.connectionsPlaceholder}>Your connections will appear here</Text>
            </View>
            
            <TouchableOpacity style={styles.sendInviteButton} onPress={sendInvite}>
              <Text style={styles.sendInviteButtonText}>Send Invitations</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 16, 
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#111827' },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  createButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    margin: 16, 
    backgroundColor: '#FFFFFF', 
    padding: 12, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    justifyContent: 'center', 
    gap: 8 
  },
  createButtonText: { fontSize: 16, fontWeight: '600', color: '#A30000' },
  listContainer: { padding: 16, paddingTop: 0 },
  projectCard: { 
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
  projectHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  projectTitle: { fontSize: 18, fontWeight: '600', color: '#111827', flex: 1 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusOpen: {
    backgroundColor: '#D1FAE5',
  },
  statusClosed: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#065F46',
  },
  projectDescription: { fontSize: 14, color: '#6B7280', marginBottom: 12, lineHeight: 20 },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  skillBadge: { 
    backgroundColor: '#FEF2F2', 
    borderRadius: 8, 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    marginRight: 8, 
    marginBottom: 8 
  },
  skillText: { fontSize: 12, color: '#A30000', fontWeight: '500' },
  projectFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingTop: 12, 
    borderTopWidth: 1, 
    borderTopColor: '#F3F4F6',
    marginBottom: 12,
  },
  membersContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  membersText: { fontSize: 12, color: '#6B7280' },
  joinButton: { backgroundColor: '#A30000', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
  joinButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  memberBadgeText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  inviteButtonText: {
    fontSize: 12,
    color: '#A30000',
    fontWeight: '500',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, width: '90%', maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  modalSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 16 },
  input: { 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 12, 
    padding: 12, 
    fontSize: 16, 
    color: '#111827', 
    marginBottom: 16, 
    backgroundColor: '#F9FAFB' 
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#A30000', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  connectionsList: {
    marginVertical: 16,
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    alignItems: 'center',
  },
  connectionsPlaceholder: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  sendInviteButton: {
    backgroundColor: '#A30000',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  sendInviteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
