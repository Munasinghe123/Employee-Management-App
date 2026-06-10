import {
  View,
  StyleSheet,
  Image,
  Text
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';

export default function Splash() {
  const router = useRouter();


  useEffect(() => {

    const timer = setTimeout(() => {
      router.replace('/loginTwo');
    }, 2500);  

    return () => clearTimeout(timer);
  }, []);



  return (
    <LinearGradient
      colors={['#8b5cf6', '#4c1d95']}
      style={styles.container}
    >
      <Image
        source={require('../assets/images/splash.png')}
        style={styles.bgImage}
        resizeMode="cover"
      />
      <View style={styles.contentContainer}>
        <View style={styles.logoCard}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.appName}>Attendance Portal</Text>
      </View>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({

  bgImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.5,
  },
  container: {
    flex: 1,
   
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: '25%',
  },

  logoCard: {
    width: 110,
    height: 110,
    borderRadius: 110,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    marginBottom: 20,

  },
  logo: {
    width: '75%',
    height: '75%',
  },
  appName: {
    fontSize: 30,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 10,
  },

});