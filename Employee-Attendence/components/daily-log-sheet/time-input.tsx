import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet } from 'react-native';


export default function TimeInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);

  function onTimeChange(_: any, selected?: Date) {
    setShow(false);
    if (!selected) return;

    const hours = selected.getHours().toString().padStart(2, '0');
    const minutes = selected.getMinutes().toString().padStart(2, '0');

    onChange(`${hours}:${minutes}`);
  }

  return (
    <View style={styles.inputWrap}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        style={styles.input}
        onPress={() => setShow(true)}
        activeOpacity={0.8}
      >
        <Text style={{ color: value ? '#111' : '#9ca3af' }}>
          {value || 'Select time'}
        </Text>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
          is24Hour
        />
      )}
    </View>
  );
}


const PURPLE = '#7c3aed';

const styles = StyleSheet.create({
  inputWrap: {
    width: '48%',
    marginBottom: 14,
  },

  label: {
    fontSize: 12,
    marginBottom: 6,
    color: '#6b7280', 
    fontWeight: '500',
  },

  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,

    borderWidth: 1,
    borderColor: '#e5e7eb',

    justifyContent: 'center',
  },
});