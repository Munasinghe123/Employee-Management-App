import 'react-native-reanimated';
import { Drawer } from 'expo-router/drawer';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { ActivityIndicator, StyleSheet, View, Text, TouchableOpacity, Modal } from 'react-native';
import { AuthContext } from '@/context/authContext';
import { useContext, useState } from 'react';
import { Redirect, useRouter } from 'expo-router';




export default function DrawerLayout() {

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const auth = useContext(AuthContext);

  if (!auth || auth.loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!auth.isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#ffffff' },
        drawerActiveBackgroundColor: '#6B46C1',
        drawerActiveTintColor: '#FFFFFF',
        headerTintColor: '#5829c5',
        drawerInactiveTintColor: '#000000',

        drawerStyle: {
          backgroundColor: '#ffffff',
        },
        drawerContentStyle: {
          backgroundColor: '#ffffff',
        },
      }}

      drawerContent={(props) => {
        const router = useRouter();

        const handleLogout = async () => {
          setShowLogoutModal(false);
          await auth?.logout();
          router.replace('/login');
        };

        return (
          <>
            <DrawerContentScrollView {...props}>
              <View style={styles.linkContainer}>
                <DrawerItemList {...props} />
              </View>

              <View style={styles.logoutContainer}>
                <TouchableOpacity
                  onPress={() => setShowLogoutModal(true)}
                  style={styles.logoutButton}
                >
                  <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </DrawerContentScrollView>

            <Modal
              visible={showLogoutModal}
              transparent
              animationType="fade"
              onRequestClose={() => setShowLogoutModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  <Text style={styles.modalTitle}>Confirm Logout</Text>
                  <Text style={styles.modalText}>
                    Are you sure you want to logout?
                  </Text>

                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setShowLogoutModal(false)}
                    >
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.confirmButton}
                      onPress={handleLogout}
                    >
                      <Text style={styles.confirmText}>Confirm</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </>
        );
      }}
    >
      <Drawer.Screen
        name="dashboard"
        options={{ title: 'Dashboard' }}
      />

      <Drawer.Screen
        name="daily-log-sheet"
        options={{ title: 'Daily Log Sheet', drawerLabel: 'Daily Log Sheet', }}
      />

    </Drawer>
  );
}

const styles = StyleSheet.create({
  linkContainer: {
    marginTop: 40,
  },

  logoutContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },

  logoutButton: {
    marginTop: 16,
    paddingVertical: 12,
  },

  logoutText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },

  //modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1F2937',
  },

  modalText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },

  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },

  cancelText: {
    color: '#374151',
    fontWeight: '500',
  },

  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#e91111',
  },

  confirmText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
