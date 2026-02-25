import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useState } from 'react';

export default function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);

  const onDateChange = (_: any, selected?: Date) => {
    setShow(false);
    if (!selected) return;

    const formatted = selected.toISOString().split('T')[0];
    onChange(formatted);
  };

  return (
    <View style={styles.inputWrap}>
      <Text style={styles.label}>{label}</Text>

      <Pressable onPress={() => setShow(true)}>
        <View pointerEvents="none">
          <TextInput
            style={styles.input}
            value={value}
            placeholder="Select date"
            editable={false}
          />
        </View>
      </Pressable>

      {show && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode="date"
          maximumDate={new Date()}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrap: {
    width: '48%',
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
    color: '#6b7280',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
  },
});
