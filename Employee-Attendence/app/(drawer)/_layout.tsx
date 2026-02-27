
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, Text } from 'react-native';
import { useContext, useState } from 'react';
import { AuthContext } from '@/context/authContext';
import { useRouter } from 'expo-router';
import { Modal } from 'react-native';
import { getGreeting, getFormattedDate } from '@/helpers/dateTime';
import { Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const auth = useContext(AuthContext);
  const router = useRouter();

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await auth?.logout();
    router.replace('/login');
  };

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#6B46C1',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopColor: '#F3F4F6',
            height: 60 + insets.bottom,
            paddingBottom: 8,
            paddingTop: 8,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          },
          headerStyle: { backgroundColor: '#6B46C1' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            headerStyle: {
              backgroundColor: '#6B46C1',
              height: 130,
            },
            headerShadowVisible: false,
            headerTitle: () => {
              const auth = useContext(AuthContext);
              const employeeName = auth?.user?.name || 'Employee';
              return (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <Image
                    // source={require('../../assets/images/user.png')}
                    style={{
                      width: 52, height: 52, borderRadius: 26,
                      borderWidth: 2.5,
                      borderColor: 'rgba(255,255,255,0.3)',
                      backgroundColor: '#E0E7FF',
                    }}
                  />
                  <View>
                    <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 2 }}>
                      {getGreeting()}
                    </Text>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 1 }}>
                      {employeeName}
                    </Text>
                    <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>
                      {getFormattedDate()}
                    </Text>
                  </View>
                </View>
              );
            },
            headerTitleAlign: 'left',
            headerLeft: () => null,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
            tabBarLabel: 'Dashboard',
          }}
        />
        <Tabs.Screen
          name="daily-log-sheet"
          options={{
            headerStyle: {
              backgroundColor: '#6B46C1',
              height: 130,
            },
            headerShadowVisible: false,
            headerTitle: () => (
              <View>
                <Text style={{
                  fontSize: 24,
                  fontWeight: '800',
                  color: '#fff',
                  marginBottom: 4,
                }}>
                  Log Sheet 
                </Text>
                <Text style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.65)',
                }}>
                  Fill in your daily shift report
                </Text>
              </View>
            ),
            headerTitleAlign: 'left',
            headerLeft: () => null,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="document-text" size={size} color={color} />
            ),
            tabBarLabel: 'Log Sheet',
          }}
        />
        <Tabs.Screen
          name="logout"
          options={{
            title: 'Logout',
            tabBarIcon: ({ color }) => (
              <Ionicons name="log-out-outline" size={24} color="#EF4444" />
            ),
            tabBarLabel: () => (
              <Text style={{ fontSize: 10, color: '#EF4444', marginBottom: 2 }}>Logout</Text>
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setShowLogoutModal(true);
            },
          }}
        />
      </Tabs>

      {/* Logout confirmation modal */}
      <Modal visible={showLogoutModal} transparent animationType="fade">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 28, padding: 28, margin: 16, marginBottom: 40 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 8 }}>Logging Out?</Text>
            <Text style={{ color: '#6B7280', textAlign: 'center', marginBottom: 24 }}>
              You'll need to sign in again to access your shift data.
            </Text>
            <TouchableOpacity
              onPress={handleLogout}
              style={{ backgroundColor: '#EF4444', padding: 16, borderRadius: 16, marginBottom: 10 }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', textAlign: 'center', fontSize: 16 }}>Yes, Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowLogoutModal(false)}
              style={{ backgroundColor: '#F3F4F6', padding: 16, borderRadius: 16 }}
            >
              <Text style={{ fontWeight: '600', textAlign: 'center', fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
