import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Modal } from 'react-native';
import { projects } from '../data/projects';
import { Ionicons } from '@expo/vector-icons';
import LogoHeader from '../components/LogoHeader';
import { UserContext } from '../context/UserContext';

export default function ProjectsScreen({ navigation }) {
  const [projectList, setProjectList] = useState(projects);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const { setUser } = useContext(UserContext);

  const createProject = () => {
    if (!title.trim()) return;

    const newProject = {
      id: Date.now().toString(),
      title,
      description,
      requiredSkills: skills.split(',').map(s => s.trim()),
      members: ['You'],
      createdAt: new Date().toISOString(),
    };

    setProjectList([newProject, ...projectList]);
    setTitle('');
    setDescription('');
    setSkills('');
    setModalVisible(false);
  };

  const handleLogout = () => {
    setUser({ email: '', skills: [], interests: [], connections: [] });
    navigation.replace('Login');
  };

  const renderProject = ({ item }) => (
    <View style={styles.projectCard}>
      <View style={styles.projectHeader}>
        <Text style={styles.projectTitle}>{item.title}</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={20} color="#9CA3AF" />
        </TouchableOpacity>
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
        <TouchableOpacity style={styles.joinButton}>
          <Text style={styles.joinButtonText}>Join Project</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LogoHeader screenName="Projects" onLogout={handleLogout} />
      
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
    borderTopColor: '#F3F4F6' 
  },
  membersContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  membersText: { fontSize: 12, color: '#6B7280' },
  joinButton: { backgroundColor: '#A30000', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
  joinButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, width: '90%', maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
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
});