
import React from 'react'
import { KeyboardAvoidingView, StyleSheet, View, Text, Platform } from 'react-native'
import { Image } from 'react-native'
import { useContext, useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { AuthContext } from '@/context/authContext';
import axios from 'axios';
import { TouchableOpacity, TextInput, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

function logintwo() {

  const router = useRouter();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const auth = useContext(AuthContext);



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
    <View
      style={styles.container}
    >
      <ImageBackground
        source={require('../assets/images/splash.png')}
        style={styles.header}
        resizeMode="cover"
      >
        <View style={styles.headerOverlay}>
          <View style={styles.logoCard}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.heroText}>
            Welcome Back
          </Text>

          <Text style={styles.heroSubText}>
            Login to continue
          </Text>
        </View>
      </ImageBackground>

      <View style={styles.body}>

        <KeyboardAvoidingView
          style={{ width: '100%' }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
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
            <View style={styles.buttonFooter} >
              <TouchableOpacity
                onPress={handleLogin}
                activeOpacity={0.85}
                style={styles.loginButtonWrapper}
              >
                <View
                  style={styles.loginButton}
                >
                  <Text style={styles.buttonText}>Sign In</Text>
                </View>
              </TouchableOpacity>
              {/* <Text style={styles.footer}>LECO Workforce 2026</Text> */}
            </View>

          </View>

        </KeyboardAvoidingView>
      </View >

    </View >
  )
}

export default logintwo

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#6330b0",
    flex: 1,
  },
  header: {
    flex: 1.3,
    width:'100%',
    justifyContent: "center",
    alignItems: "center",
    gap: 5
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(99, 48, 176, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    width: '100%',
  },
  logoHalo: {
    width: 130,
    height: 130,
    borderRadius: 130,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCard: {
    width: 140,
    height: 140,
    borderRadius: 140,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
  },
  logo: {
    width: '80%',
    height: '80%',
  },
  heroText: {
    color: "#e4e4e4",
    fontSize: 30,
    fontWeight: '800',
  },
  heroSubText: {
    color: "#c5c5c5",
    fontSize: 15,
    fontWeight: '500',
  },
  body: {
    flex: 1,
    // height: height * 0.55,
    backgroundColor: '#ffffff',
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 40,
  },

  fieldsBlock: {
    width: '100%',
    gap: 15,
  },

  fieldLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    letterSpacing: 2,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#dddfe2',
    marginBottom: 20,
    height: 56,
    paddingHorizontal: 20
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
    backgroundColor: '#6B46C1',
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
  buttonFooter: {
    gap: 15
  },
  footer: {
    alignSelf: 'center',
    fontSize: 11,
    color: '#D1D5DB',
    letterSpacing: 1.5,
  },
});
