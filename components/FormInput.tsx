import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type TextStyle,
} from 'react-native';

type Props = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  showCheck?: boolean;
  style?: StyleProp<TextStyle>;
};

export default function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  multiline,
  showCheck = true,
  style,
}: Props) {
  return (
    <View style={styles.inputWrapper}>
      {label ? <Text style={styles.sectionLabelVerde}>{label}</Text> : null}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, style]}
          placeholder={placeholder}
          placeholderTextColor="#bdbdbd"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
        />
        {showCheck && value.length > 0 && <Text style={styles.checkIcon}>✓</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: { marginBottom: 15 },
  sectionLabelVerde: { fontSize: 12, color: '#88C9BF', marginBottom: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#bdbdbd' },
  input: { flex: 1, paddingVertical: 8, fontSize: 14, color: '#434343' },
  checkIcon: { color: '#88C9BF', fontSize: 18, fontWeight: 'bold', marginLeft: 5 },
});
