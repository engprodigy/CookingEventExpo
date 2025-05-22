import React from 'react';
import { TouchableOpacity, StyleSheet, Animated, View } from 'react-native';
import { useTheme } from './ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const [animation] = React.useState(new Animated.Value(isDark ? 1 : 0));

  React.useEffect(() => {
    Animated.spring(animation, {
      toValue: isDark ? 1 : 0,
      useNativeDriver: true,
      tension: 20,
      friction: 7,
    }).start();
  }, [isDark]);

  const rotateSun = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const rotateMoon = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['-180deg', '0deg'],
  });

  const scaleSun = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const scaleMoon = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: isDark ? '#2c2c2c' : '#f0f0f0' }]}
      onPress={toggleTheme}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Animated.Text
          style={[
            styles.icon,
            {
              transform: [{ rotate: rotateSun }, { scale: scaleSun }],
              opacity: scaleSun,
            },
          ]}
        >
          ☀️
        </Animated.Text>
        <Animated.Text
          style={[
            styles.icon,
            {
              transform: [{ rotate: rotateMoon }, { scale: scaleMoon }],
              opacity: scaleMoon,
            },
          ]}
        >
          🌙
        </Animated.Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    position: 'absolute',
    fontSize: 24,
  },
});

export default ThemeToggle; 