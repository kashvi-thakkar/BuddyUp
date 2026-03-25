import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import DiscoveryScreen from '../screens/DiscoveryScreen';
import FeedScreen from '../screens/FeedScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs({ setIsLoggedIn }) {
  return (
    <Tab.Navigator
      initialRouteName="Discovery"
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Discovery" component={DiscoveryScreen} />
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Projects" component={ProjectsScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile">
        {(props) => <ProfileScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}