import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { UserContext } from '../context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ navigation, setIsLoggedIn }) {
  const { user, setUser } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('about');

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('user');
          setUser({ email: '', skills: [], interests: [], connections: [] });
          setIsLoggedIn(false);
        }
      }
    ]);
  };

  const stats = [
    { label: 'Connections', value: user.connections?.length || 0, icon: 'people' },
    { label: 'Projects', value: user.projects?.length || 3, icon: 'folder-open' },
    { label: 'Posts', value: user.posts?.length || 5, icon: 'newspaper' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Cover Photo */}
      <View style={styles.coverPhoto}>
        <Image 
          source={{ uri: user.coverPhoto || 'https://via.placeholder.com/400x150/A30000/FFFFFF' }} 
          style={styles.coverImage}
        />
      </View>

      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          {user.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.avatar} />
          ) : (
            <Text style={styles.avatarText}>{user.email?.charAt(0).toUpperCase() || 'U'}</Text>
          )}
        </View>
        
        <Text style={styles.name}>{user.name || user.email?.split('@')[0] || 'Student'}</Text>
        <Text style={styles.headline}>{user.headline || 'Student at College'}</Text>
        <Text style={styles.location}>{user.location || '📍 College Campus'}</Text>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
            <Ionicons name="create-outline" size={18} color="#A30000" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.connectionsButton} onPress={() => navigation.navigate('Connections')}>
            <Ionicons name="people-outline" size={18} color="#A30000" />
            <Text style={styles.connectionsButtonText}>Connections</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <TouchableOpacity key={index} style={styles.statCard} onPress={() => {
            if (stat.label === 'Connections') navigation.navigate('Connections');
          }}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, activeTab === 'about' && styles.activeTab]} onPress={() => setActiveTab('about')}>
          <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>About</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'activity' && styles.activeTab]} onPress={() => setActiveTab('activity')}>
          <Text style={[styles.tabText, activeTab === 'activity' && styles.activeTabText]}>Activity</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'projects' && styles.activeTab]} onPress={() => setActiveTab('projects')}>
          <Text style={[styles.tabText, activeTab === 'projects' && styles.activeTabText]}>Projects</Text>
        </TouchableOpacity>
      </View>

      {/* About Tab Content */}
      {activeTab === 'about' && (
        <View style={styles.tabContent}>
          {/* Bio */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bio</Text>
            <Text style={styles.bioText}>{user.bio || 'Student passionate about technology and collaboration. Looking to connect with like-minded peers.'}</Text>
          </View>

          {/* Skills */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsContainer}>
              {user.skills?.map((skill) => (
                <View key={skill} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
              {(!user.skills || user.skills.length === 0) && (
                <Text style={styles.emptyText}>Add skills to showcase your expertise</Text>
              )}
            </View>
          </View>

          {/* Education */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {user.education?.map((edu, index) => (
              <View key={index} style={styles.educationItem}>
                <Ionicons name="school-outline" size={20} color="#A30000" />
                <View style={styles.educationInfo}>
                  <Text style={styles.educationDegree}>{edu.degree}</Text>
                  <Text style={styles.educationSchool}>{edu.school}</Text>
                  <Text style={styles.educationYear}>{edu.year}</Text>
                </View>
              </View>
            ))}
            {(!user.education || user.education.length === 0) && (
              <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddEducation')}>
                <Ionicons name="add-circle-outline" size={20} color="#A30000" />
                <Text style={styles.addButtonText}>Add Education</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Experience */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {user.experience?.map((exp, index) => (
              <View key={index} style={styles.experienceItem}>
                <Ionicons name="briefcase-outline" size={20} color="#A30000" />
                <View style={styles.experienceInfo}>
                  <Text style={styles.experienceTitle}>{exp.title}</Text>
                  <Text style={styles.experienceCompany}>{exp.company}</Text>
                  <Text style={styles.experienceDate}>{exp.startDate} - {exp.endDate}</Text>
                </View>
              </View>
            ))}
            {(!user.experience || user.experience.length === 0) && (
              <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddExperience')}>
                <Ionicons name="add-circle-outline" size={20} color="#A30000" />
                <Text style={styles.addButtonText}>Add Experience</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Activity Tab Content */}
      {activeTab === 'activity' && (
        <View style={styles.tabContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {user.activities?.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Text style={styles.activityText}>{activity}</Text>
              </View>
            ))}
            {(!user.activities || user.activities.length === 0) && (
              <Text style={styles.emptyText}>No recent activity</Text>
            )}
          </View>
        </View>
      )}

      {/* Projects Tab Content */}
      {activeTab === 'projects' && (
        <View style={styles.tabContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {user.userProjects?.map((project, index) => (
              <View key={index} style={styles.projectItem}>
                <Ionicons name="folder-outline" size={20} color="#A30000" />
                <View style={styles.projectInfo}>
                  <Text style={styles.projectTitle}>{project.title}</Text>
                  <Text style={styles.projectDescription}>{project.description}</Text>
                </View>
              </View>
            ))}
            {(!user.userProjects || user.userProjects.length === 0) && (
              <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('Projects')}>
                <Ionicons name="add-circle-outline" size={20} color="#A30000" />
                <Text style={styles.addButtonText}>Create Project</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  coverPhoto: { height: 120, backgroundColor: '#A30000' },
  coverImage: { width: '100%', height: '100%' },
  profileHeader: { 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    paddingTop: 50,
    paddingBottom: 20,
    marginTop: -40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#A30000',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: '#FFFFFF' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginTop: 12 },
  headline: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  location: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  actionButtons: { flexDirection: 'row', gap: 12, marginTop: 16 },
  editButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FEF2F2' },
  editButtonText: { fontSize: 14, color: '#A30000', fontWeight: '600' },
  connectionsButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6' },
  connectionsButtonText: { fontSize: 14, color: '#A30000', fontWeight: '600' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: 20, backgroundColor: '#FFFFFF', marginTop: 1 },
  statCard: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#A30000' },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  tabBar: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingHorizontal: 20, marginTop: 1 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#A30000' },
  tabText: { fontSize: 14, color: '#6B7280' },
  activeTabText: { color: '#A30000', fontWeight: '600' },
  tabContent: { padding: 20 },
  section: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },
  bioText: { fontSize: 14, color: '#4B5563', lineHeight: 20 },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillBadge: { backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  skillText: { fontSize: 14, color: '#A30000', fontWeight: '500' },
  emptyText: { fontSize: 14, color: '#9CA3AF', fontStyle: 'italic' },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  addButtonText: { fontSize: 14, color: '#A30000', fontWeight: '500' },
  educationItem: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  educationInfo: { flex: 1 },
  educationDegree: { fontSize: 14, fontWeight: '600', color: '#111827' },
  educationSchool: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  educationYear: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  experienceItem: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  experienceInfo: { flex: 1 },
  experienceTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  experienceCompany: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  experienceDate: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  activityItem: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  activityText: { fontSize: 14, color: '#4B5563', flex: 1 },
  projectItem: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  projectInfo: { flex: 1 },
  projectTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  projectDescription: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#A30000', margin: 20, paddingVertical: 14, borderRadius: 12 },
  logoutButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});