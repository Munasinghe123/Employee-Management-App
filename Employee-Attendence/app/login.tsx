import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import axios from 'axios';
import { useContext, useEffect } from 'react';
import { AuthContext } from '@/context/authContext';

const { width, height } = Dimensions.get('window');

// How tall the purple top section is — exactly half the screen
const TOP_SECTION_HEIGHT = height * 0.5;

// Wave height
const WAVE_HEIGHT = 70;

export default function Login() {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const auth = useContext(AuthContext);

  // const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    if (auth?.token) {
      router.replace('/dashboard');
    }
  }, [auth?.token]);


  if (!auth) throw new Error('AuthContext must be used within AuthProvider');
  const { login } = auth;

  const handleLogin = async () => {
    try {
      if (!employeeId || !password) {
        alert('Please enter Employee ID and password');
        return;
      }

      const response = await axios.post(
        // `${BASE_URL}/auth/login`,
        'http://localhost:7000/auth/login',
        { employeeId, password },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const { accessToken } = response.data;
      await login(accessToken);
      router.replace('/dashboard');
    } catch (error: any) {
      if (error.response) {
        alert(error.response.data.message || 'Login failed');
      } else {
        alert('Server not reachable');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#ffffff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#C084FC', '#7C3AED', '#4C1D95']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={[styles.container, { backgroundColor: '#4C1D95' }]}
      >
        {/* ── DECORATIVE GLOW ORBS ── */}
        <Svg style={StyleSheet.absoluteFill} width={width} height={height}>
          <Defs>
            <RadialGradient id="orb1" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#E9D5FF" stopOpacity="0.18" />
              <Stop offset="100%" stopColor="#E9D5FF" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="orb2" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#DDD6FE" stopOpacity="0.12" />
              <Stop offset="100%" stopColor="#DDD6FE" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx={width * 0.85} cy={80} r={110} fill="url(#orb1)" />
          <Circle cx={width * 0.15} cy={TOP_SECTION_HEIGHT * 0.7} r={80} fill="url(#orb2)" />
        </Svg>

        {/* ── TOP PURPLE SECTION ──
            Fixed height = exactly half the screen minus the wave height
        ── */}
        <View style={[styles.topSection, { height: TOP_SECTION_HEIGHT - WAVE_HEIGHT }]}>
          <View style={styles.logoHalo}>
            <View style={styles.logoCard}>
              <Image
                source={require('../assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>
          <Text style={styles.signInTitle}>Sign In</Text>
          <Text style={styles.signInSubtitle}>LECO WORKFORCE</Text>
        </View>

        {/* ── WAVE ──
            Fixed height WAVE_HEIGHT, fills the remaining half-screen gap
        ── */}
        <Svg
          width={width}
          height={WAVE_HEIGHT}
          viewBox={`0 0 ${width} ${WAVE_HEIGHT}`}
          style={{ marginBottom: -1 }}
        >
          <Path
            d={`
              M0,${WAVE_HEIGHT * 0.55}
              Q${width * 0.25},${WAVE_HEIGHT * 0.05} ${width * 0.5},${WAVE_HEIGHT * 0.4}
              Q${width * 0.75},${WAVE_HEIGHT * 0.75} ${width},${WAVE_HEIGHT * 0.25}
              L${width},${WAVE_HEIGHT}
              L0,${WAVE_HEIGHT}
              Z
            `}
            fill="white"
          />
        </Svg>

        <View style={styles.whiteSection}>

          {/* Fields */}
          <View style={styles.fieldsBlock}>
            <View>
              <Text style={styles.fieldLabel}>EMPLOYEE ID</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.iconBox}>
                  <Ionicons name="person-outline" size={18} color="#7C3AED" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your employee ID"
                  value={employeeId}
                  onChangeText={setEmployeeId}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor="#D1D5DB"
                />
                {employeeId.length > 0 && (
                  <View style={styles.checkBox}>
                    <Ionicons name="checkmark" size={16} color="#10B981" />
                  </View>
                )}
              </View>
            </View>

            <View>
              <Text style={styles.fieldLabel}>PASSWORD</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.iconBox}>
                  <Ionicons name="lock-closed-outline" size={18} color="#7C3AED" />
                </View>
                <TextInput
                  style={[styles.input, { paddingRight: 48 }]}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor="#D1D5DB"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>


            {/* Button + footer */}
            <View >
              <TouchableOpacity
                onPress={handleLogin}
                activeOpacity={0.85}
                style={styles.loginButtonWrapper}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#6B46C1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginButton}
                >
                  <Text style={styles.buttonText}>Sign In</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  topSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },

  logoHalo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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

  signInTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
    marginBottom: 5,
  },

  signInSubtitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 3,
    fontWeight: '500',
  },

  // ── WHITE SECTION ──
  whiteSection: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 44,
    marginBottom: -500,
  },

  fieldsBlock: {
    width: '100%',
    gap: 20
  },


  fieldLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    letterSpacing: 2,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: 20,
    height: 56,
    paddingHorizontal: 14,
  },

  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },

  checkBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  eyeButton: {
    position: 'absolute',
    right: 14,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
  },

  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: -8,
  },

  forgotText: {
    color: '#7C3AED',
    fontSize: 13,
    fontWeight: '600',
  },

  loginButtonWrapper: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
    marginBottom: 16,
  },

  loginButton: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  footer: {
    color: '#D1D5DB',
    fontSize: 10,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});