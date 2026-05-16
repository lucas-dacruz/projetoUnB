import { StyleSheet, Text, TouchableOpacity, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

type Props = {
  title: string;
  leftText?: string;
  rightText?: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  leftTextStyle?: StyleProp<TextStyle>;
  rightTextStyle?: StyleProp<TextStyle>;
};

export default function ScreenHeader({
  title,
  leftText,
  rightText,
  onLeftPress,
  onRightPress,
  style,
  titleStyle,
  leftTextStyle,
  rightTextStyle,
}: Props) {
  return (
    <View style={[styles.header, style]}>
      {leftText ? (
        <TouchableOpacity onPress={onLeftPress} disabled={!onLeftPress}>
          <Text style={[styles.icon, leftTextStyle]}>{leftText}</Text>
        </TouchableOpacity>
      ) : null}

      <Text style={[styles.title, titleStyle]}>{title}</Text>

      {rightText ? (
        <TouchableOpacity onPress={onRightPress} disabled={!onRightPress}>
          <Text style={[styles.icon, rightTextStyle]}>{rightText}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#CFE9E5',
    height: 90,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },

  icon: {
    fontSize: 24,
    color: '#434343',
    marginRight: 20,
  },

  title: {
    fontSize: 20,
    color: '#434343',
    fontWeight: '500',
  },
});
