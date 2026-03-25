import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const PasswordInput = ({ label = 'Password', value, onChange, placeholder = 'Enter your password' }) => (
  <View style={styles.wrapper}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={value}
      onChangeText={onChange}
      secureTextEntry
      autoCapitalize="none"
    />
  </View>
);

const styles = StyleSheet.create({
  wrapper: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#374151' },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
});

export default PasswordInput;
