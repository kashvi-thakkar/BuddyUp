import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Modal, Alert, Image } from 'react-native';
import { posts } from '../data/posts';
import { rankPosts } from '../utils/feedRanking';
import { UserContext } from '../context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import LogoHeader from '../components/LogoHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FeedScreen = ({ navigation }) => {
  const [rankedPosts, setRankedPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [likedPosts, setLikedPosts] = useState([]);
  const [comments, setComments] = useState({});
  const { user, setUser } = useContext(UserContext);

  const currentUser = {
    interests: user.interests || ['AI', 'Development', 'Programming'],
  };

  useEffect(() => {
    loadFeed();
    loadUserInteractions();
  }, []);

  const loadFeed = () => {
    const sorted = rankPosts(posts, currentUser);
    setRankedPosts(sorted);
  };

  const loadUserInteractions = async () => {
    try {
      const savedLikes = await AsyncStorage.getItem('likedPosts');
      if (savedLikes) setLikedPosts(JSON.parse(savedLikes));
      
      const savedComments = await AsyncStorage.getItem('comments');
      if (savedComments) setComments(JSON.parse(savedComments));
    } catch (error) {
      console.error('Error loading interactions:', error);
    }
  };

  const handleLike = async (postId) => {
    const isLiked = likedPosts.includes(postId);
    
    if (isLiked) {
      setLikedPosts(likedPosts.filter(id => id !== postId));
      setRankedPosts(prev =>
        prev.map(post =>
          post.id === postId ? { ...post, likes: post.likes - 1 } : post
        )
      );
    } else {
      setLikedPosts([...likedPosts, postId]);
      setRankedPosts(prev =>
        prev.map(post =>
          post.id === postId ? { ...post, likes: post.likes + 1 } : post
        )
      );
    }
    
    await AsyncStorage.setItem('likedPosts', JSON.stringify(
      isLiked ? likedPosts.filter(id => id !== postId) : [...likedPosts, postId]
    ));
  };

  const handleReply = async () => {
    if (!replyText.trim()) {
      Alert.alert('Error', 'Please enter a reply');
      return;
    }
    
    const newComment = {
      id: Date.now().toString(),
      text: replyText,
      userName: user.email?.split('@')[0] || 'User',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    const updatedComments = {
      ...comments,
      [selectedPost.id]: [...(comments[selectedPost.id] || []), newComment]
    };
    
    setComments(updatedComments);
    await AsyncStorage.setItem('comments', JSON.stringify(updatedComments));
    
    setRankedPosts(prev =>
      prev.map(post =>
        post.id === selectedPost.id ? { ...post, replies: post.replies + 1 } : post
      )
    );
    
    Alert.alert('Success', 'Reply posted successfully!');
    setReplyText('');
    setModalVisible(false);
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

  const getCategoryIcon = (type) => {
    switch(type) {
      case 'Development': return 'code-slash';
      case 'AI': return 'bulb-outline';
      case 'Design': return 'color-palette-outline';
      default: return 'chatbubble-outline';
    }
  };

  const getCategoryColor = (type) => {
    switch(type) {
      case 'Development': return '#6366F1';
      case 'AI': return '#10B981';
      case 'Design': return '#F59E0B';
      default: return '#A30000';
    }
  };

  const renderPost = ({ item }) => {
    const isLiked = likedPosts.includes(item.id);
    const postComments = comments[item.id] || [];
    
    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.type) + '15' }]}>
            <Ionicons name={getCategoryIcon(item.type)} size={14} color={getCategoryColor(item.type)} />
            <Text style={[styles.categoryText, { color: getCategoryColor(item.type) }]}>{item.type}</Text>
          </View>
          <View style={styles.relevanceBadge}>
            <Ionicons name="trending-up" size={12} color="#6B7280" />
            <Text style={styles.relevanceText}>Score: {item.score}</Text>
          </View>
        </View>

        <Text style={styles.postTitle}>{item.title}</Text>
        
        {item.description && (
          <Text style={styles.postDescription}>{item.description}</Text>
        )}

        <View style={styles.postFooter}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item.id)}>
            <Ionicons name={isLiked ? "heart" : "heart-outline"} size={20} color={isLiked ? "#A30000" : "#6B7280"} />
            <Text style={[styles.actionText, isLiked && styles.likedText]}>{item.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => {
            setSelectedPost(item);
            setModalVisible(true);
          }}>
            <Ionicons name="chatbubble-outline" size={20} color="#6B7280" />
            <Text style={styles.actionText}>{item.replies + postComments.length}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
        
        {postComments.length > 0 && (
          <View style={styles.commentsPreview}>
            <Text style={styles.commentsPreviewText}>
              💬 {postComments.length} comment{postComments.length > 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LogoHeader screenName="FeedScreen" onLogout={handleLogout} navigation={navigation} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Feed</Text>
        <Text style={styles.headerSubtitle}>Personalized for your interests</Text>
      </View>

      <FlatList
        data={rankedPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
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
              <Text style={styles.modalTitle}>Reply to Post</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>{selectedPost?.title}</Text>
            
            <View style={styles.commentsList}>
              {comments[selectedPost?.id]?.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <Text style={styles.commentUser}>{comment.userName}</Text>
                  <Text style={styles.commentText}>{comment.text}</Text>
                  <Text style={styles.commentTime}>{comment.timestamp}</Text>
                </View>
              ))}
            </View>
            
            <TextInput
              style={styles.replyInput}
              placeholder="Write your reply..."
              placeholderTextColor="#9CA3AF"
              value={replyText}
              onChangeText={setReplyText}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.sendButton]} onPress={handleReply}>
                <Text style={styles.sendButtonText}>Post Reply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#111827' },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  listContainer: { padding: 16 },
  postCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 20, 
    padding: 16, 
    marginBottom: 16, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 8, 
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  postHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  categoryBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 20,
    gap: 4,
  },
  categoryText: { 
    fontSize: 12, 
    fontWeight: '600',
  },
  relevanceBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4,
    backgroundColor: '#F9FAFB', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12,
  },
  relevanceText: { fontSize: 11, color: '#6B7280' },
  postTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 8, lineHeight: 24 },
  postDescription: { fontSize: 14, color: '#4B5563', lineHeight: 20, marginBottom: 12 },
  postFooter: { 
    flexDirection: 'row', 
    paddingTop: 12, 
    borderTopWidth: 1, 
    borderTopColor: '#F3F4F6', 
    gap: 24 
  },
  actionButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6,
    paddingVertical: 4,
  },
  actionText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  likedText: { color: '#A30000' },
  commentsPreview: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  commentsPreviewText: {
    fontSize: 12,
    color: '#6B7280',
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: '#FFFFFF', 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    padding: 20, 
    maxHeight: '80%',
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  modalSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 16, fontWeight: '500' },
  commentsList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  commentItem: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  commentUser: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A30000',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 4,
  },
  commentTime: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  replyInput: { 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 12, 
    padding: 12, 
    fontSize: 16, 
    color: '#111827', 
    minHeight: 80, 
    textAlignVertical: 'top', 
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cancelButton: { backgroundColor: '#F3F4F6' },
  cancelButtonText: { color: '#6B7280', fontWeight: '600', fontSize: 15 },
  sendButton: { backgroundColor: '#A30000' },
  sendButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
});

export default FeedScreen;