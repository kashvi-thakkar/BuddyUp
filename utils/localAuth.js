import AsyncStorage from '@react-native-async-storage/async-storage';

export const signupUser = async (user) => {
  try {
    await AsyncStorage.setItem('user', JSON.stringify(user));
  } catch (error) {
    console.error('Error signing up:', error);
  }
};

export const loginUser = async (email, password) => {
  try {
    const data = await AsyncStorage.getItem('user');
    if (!data) return false;

    const user = JSON.parse(data);
    return user.email === email && user.password === password;
  } catch (error) {
    console.error('Error logging in:', error);
    return false;
  }
};

export const getCurrentUser = async () => {
  try {
    const data = await AsyncStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const logoutUser = async () => {
  try {
    await AsyncStorage.removeItem('user');
  } catch (error) {
    console.error('Error logging out:', error);
  }
};