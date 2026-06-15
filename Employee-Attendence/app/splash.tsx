import {
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';

export default function Splash() {
  const router = useRouter();

  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const haloAnim = useRef(new Animated.Value(0)).current; 

  useEffect(() => {
    // Step 1: logo + card appear together
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Step 2: halo pulses in AFTER logo appears
      Animated.timing(haloAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    });

    // const timer = setTimeout(() => {
    //   router.replace('/login');
    // }, 2500);  

    // return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Logo scale + fade animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace('/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['#8b5cf6', '#4c1d95']}
      style={styles.container}
    >
      <View>
        <View style={styles.logoHalo}>
          <View>
            <Animated.View style={[
              styles.logoHalo,
              {
                opacity: haloAnim,           // ← fades in after card
                transform: [{
                  scale: haloAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.6, 1], // ← grows in
                  })
                }]
              }
            ]}>
              <Animated.View style={[
                styles.logoCard,
                {
                  transform: [{ scale: scaleAnim }],
                  opacity: fadeAnim,
                }
              ]}>
                <Animated.Image
                  source={require('../assets/images/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </Animated.View>
            </Animated.View>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoHalo: {
    width: 120,
    height: 120,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCard: {
    width: 110,
    height: 110,
    borderRadius: 110,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
  },

  logo: {
    width: '80%',
    height: '80%',
  },
});