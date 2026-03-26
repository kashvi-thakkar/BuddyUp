import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LogoHeader from '../components/LogoHeader';
import { UserContext } from '../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MessagesScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const savedMessages = await AsyncStorage.getItem('messages');
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        // Sample welcome message
        setMessages([
          { 
            id: '1', 
            text: 'Welcome to BuddyUp! Connect with peers and start collaborating.', 
            sender: 'system', 
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const saveMessages = async (newMessages) => {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(newMessages));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    await saveMessages(updatedMessages);
    setInput('');
    
    // Simulate reply after 2 seconds
    setTimeout(() => {
      const replyMessage = {
        id: (Date.now() + 1).toString(),
        text: getAutoReply(input),
        sender: 'other',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      const messagesWithReply = [...updatedMessages, replyMessage];
      setMessages(messagesWithReply);
      saveMessages(messagesWithReply);
    }, 2000);
    
    setTyping(true);
    setTimeout(() => setTyping(false), 1500);
  };

  const getAutoReply = (message) => {
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
      return 'Hello! How can I help you today?';
    }
    if (lowerMsg.includes('project')) {
      return 'I\'d love to collaborate on a project! What kind of project are you thinking about?';
    }
    if (lowerMsg.includes('skill') || lowerMsg.includes('learn')) {
      return 'Great! Sharing knowledge is what BuddyUp is all about. What skills are you interested in?';
    }
    if (lowerMsg.includes('hackathon')) {
      return 'Hackathons are awesome! Have you participated in any before?';
    }
    return 'Thanks for your message! Let\'s connect and collaborate on something amazing.';
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

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer, 
      item.sender === 'me' ? styles.myMessage : styles.otherMessage,
      item.sender === 'system' && styles.systemMessage
    ]}>
      {item.sender !== 'me' && item.sender !== 'system' && (
        <Text style={styles.senderName}>BuddyUp Assistant</Text>
      )}
      <Text style={[
        styles.messageText, 
        item.sender === 'me' ? styles.myMessageText : styles.otherMessageText,
        item.sender === 'system' && styles.systemMessageText
      ]}>
        {item.text}
      </Text>
      <Text style={styles.timestamp}>{item.timestamp}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LogoHeader screenName="MessagesScreen" onLogout={handleLogout} navigation={navigation} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <Text style={styles.headerSubtitle}>Connect with your peers</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        inverted={false}
      />
      
      {typing && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>BuddyUp Assistant is typing...</Text>
        </View>
      )}

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#9CA3AF"
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  messagesList: { padding: 16, paddingBottom: 20 },
  messageContainer: { maxWidth: '80%', marginBottom: 12, padding: 12, borderRadius: 16 },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#A30000' },
  otherMessage: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
  systemMessage: { alignSelf: 'center', backgroundColor: '#F3F4F6', maxWidth: '90%' },
  senderName: { fontSize: 10, fontWeight: '600', color: '#A30000', marginBottom: 4 },
  messageText: { fontSize: 14, lineHeight: 20 },
  myMessageText: { color: '#FFFFFF' },
  otherMessageText: { color: '#111827' },
  systemMessageText: { color: '#6B7280', fontStyle: 'italic' },
  timestamp: { fontSize: 10, color: '#9CA3AF', marginTop: 4, alignSelf: 'flex-end' },
  typingIndicator: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  inputContainer: { 
    flexDirection: 'row', 
    padding: 16, 
    backgroundColor: '#FFFFFF', 
    borderTopWidth: 1, 
    borderTopColor: '#F3F4F6', 
    alignItems: 'flex-end' 
  },
  input: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 20, 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    fontSize: 16, 
    color: '#111827', 
    backgroundColor: '#F9FAFB', 
    maxHeight: 100 
  },
  sendButton: { 
    backgroundColor: '#A30000', 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginLeft: 12 
  },
});