import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '@/context/authContext';
import * as Location from 'expo-location';
import axios from 'axios';
import { Modal } from 'react-native';
import { ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';


export default function Dashboard() {


    type CurrentShift = {
        id: number;
        shift_date: string;

        status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

        startTime: string;
        endTime: string;
        shiftCategory: string;

        substation_id: number;
        substation_name: string;
    };

    type AttendenceStatus = {
        attendance_status: 'PENDING' | 'PRESENT' | 'ON_LEAVE' | 'ABSENT';
    }

    type WeeklyStats = {
        totalMinutes: number;
        overtimeMinutes: number;
        remainingMinutes: number;
        weeklyLimitMinutes: number;
    };

    const getShiftLabel = (shift: any) => {
        if (!shift) return "—";

        if (shift.shiftId === "SH-1") return "Day Shift";
        if (shift.shiftId === "SH-2") return "Night Shift - Part 1";
        if (shift.shiftId === "SH-3") return "Night Shift - Part 2";

        return "Shift";
    };

    const [currentShift, setCurrentShift] = useState<CurrentShift | null>(null);
    const [loading, setLoading] = useState(true);
    const [attendanceStatus, setAttendanceStatus] = useState<AttendenceStatus | null>(null);
    const [showCheckInModal, setShowCheckInModal] = useState(false);
    const [showCheckOutModal, setShowCheckOutModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);
    const [modalSuccess, setModalSuccess] = useState(false);
    const [shiftStats, setShiftStats] = useState({
        dayShifts: 0,
        nightShifts: 0,
        totalShifts: 0
    });
    const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
        totalMinutes: 0,
        overtimeMinutes: 0,
        remainingMinutes: 0,
        weeklyLimitMinutes: 45 * 60
    });

    const auth = useContext(AuthContext);

    const fetchAttendanceStatus = async () => {
        try {
            const res = await axios.get(
                'http://localhost:7000/attendance/status',
                {
                    headers: {
                        Authorization: `Bearer ${auth?.token}`,
                    },
                }
            );

            setAttendanceStatus(res.data);
            console.log("current attendence data", res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (!auth?.token) return;

        const fetchShift = async () => {
            try {
                const res = await axios.get('http://localhost:7000/shift/current', {
                    headers: {
                        Authorization: `Bearer ${auth.token}`,
                    },
                });

                setCurrentShift(res.data);
                console.log('Current Shift Data:', res.data);
            } catch (err) {
                console.error(err);
                setCurrentShift(null);
            } finally {
                setLoading(false);
            }
        };

        const fetchWeeklyShiftStats = async () => {
            try {
                const response = await axios.get('http://localhost:7000/shift/weekly-shifts', {
                    headers: {
                        Authorization: `Bearer ${auth.token}`,
                    },
                })

                setShiftStats(response.data);
                console.log("weekly shift stats", response.data);
            } catch (error) {

            }
        }

        const fetchWeeklyStats = async () => {
            const res = await axios.get(
                "http://localhost:7000/attendance/weekly-hours",
                {
                    headers: {
                        Authorization: `Bearer ${auth?.token}`
                    }
                }
            );

            console.log("weeky stats", res.data);

            setWeeklyStats(res.data);
        }

        fetchWeeklyStats();
        fetchWeeklyShiftStats();
        fetchAttendanceStatus();
        fetchShift();

        //second call every minute
        const interval = setInterval(() => {
            fetchWeeklyShiftStats();
            fetchWeeklyStats();
            fetchShift();
            fetchAttendanceStatus();
        }, 60000);

        return () => clearInterval(interval);
    }, [auth?.token]);


    const location = auth?.user?.substation?.name || '—';

    const shiftTime = currentShift
        ? `${currentShift.startTime.slice(0, 5)} – ${currentShift.endTime.slice(0, 5)}`
        : '—';


    // Weekly shifts
    const totalShiftsThisWeek = shiftStats.totalShifts;
    const dayShifts = shiftStats.dayShifts;
    const nightShifts = shiftStats.nightShifts;


    const employeeName = auth?.user?.name || 'Employee';
    const isCheckedIn = attendanceStatus?.attendance_status === 'PRESENT';

    console.log("attendence status", attendanceStatus?.attendance_status);

    console.log('User from AuthContext:', auth?.user?.userName);

    // modal operations
    //check in user
    const confirmCheckIn = async () => {
        try {
            setModalLoading(true);
            setModalError(null);

            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                setModalError("Location permission required");
                setModalLoading(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const { latitude, longitude } = location.coords;

            const response = await axios.post(
                'http://localhost:7000/attendance/checkin',
                { latitude, longitude },
                {
                    headers: {
                        Authorization: `Bearer ${auth?.token}`,
                    },
                }
            );

            if (response.data.attendance_status === "PRESENT") {

                //  Haptic feedback
                await Haptics.impactAsync(
                    Haptics.ImpactFeedbackStyle.Medium
                );

                //  Show green check
                setModalSuccess(true);

                // Refresh status
                await fetchAttendanceStatus();

                // Wait 1s so user sees success
                setTimeout(() => {
                    resetModalState();
                    setModalSuccess(false);
                    setShowCheckInModal(false);
                }, 1000);
            }

        } catch (error: any) {
            setModalError(
                error.response?.data?.message || "Check-in failed"
            );
        } finally {
            setModalLoading(false);
        }
    };


    //check out user
    const confirmCheckOut = async () => {
        try {
            setModalLoading(true);
            setModalError(null);

            console.log("CHECKOUT FUNCTION CALLED");

            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                setModalError("Location permission required");
                setModalLoading(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const { latitude, longitude } = location.coords;

            console.log("lat", latitude, "log", longitude);

            const response = await axios.post(
                'http://localhost:7000/attendance/checkout',
                { latitude, longitude },
                {
                    headers: {
                        Authorization: `Bearer ${auth?.token}`,
                    },
                }
            );

            if (response.data.attendance_status === "PENDING") {

                await Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success
                );

                setModalSuccess(true);

                await fetchAttendanceStatus();

                setTimeout(() => {
                    resetModalState();
                    setModalSuccess(false);
                    setShowCheckOutModal(false);
                }, 800);
            }

        } catch (error: any) {
            setModalError(
                error.response?.data?.message || "Check-out failed"
            );
        } finally {
            setModalLoading(false);
        }
    };

    const resetModalState = () => {
        setModalError(null);
        setModalSuccess(false);
        setModalLoading(false);
    };

    const formatDuration = (minutes: number) => {
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hrs === 0) return `${mins} mins`;
        if (mins === 0) return `${hrs} hrs`;

        return `${hrs}h ${mins}m`;
    };

    return (
        <>
            <StatusBar style="light" />

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                contentInsetAdjustmentBehavior="never"
                automaticallyAdjustContentInsets={false}
                automaticallyAdjustsScrollIndicatorInsets={false}
                bounces={false}
            >

                {/* MAIN CONTENT */}
                <View style={styles.content}>
                    {/* STATS ROW */}
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: '#EDE9FE' }]}>
                                <Ionicons name="calendar" size={20} color="#6B46C1" />
                            </View>
                            <Text style={styles.statValue}>{totalShiftsThisWeek}</Text>
                            <Text style={styles.statLabel} >This Week</Text>
                        </View>

                        <View style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
                                <Ionicons name="sunny" size={20} color="#10B981" />
                            </View>
                            <Text style={styles.statValue}>{dayShifts}</Text>
                            <Text style={styles.statLabel}>Day Shifts</Text>
                        </View>

                        <View style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
                                <Ionicons name="moon" size={20} color="#3B82F6" />
                            </View>
                            <Text style={styles.statValue}>{nightShifts}</Text>
                            <Text style={styles.statLabel}>Night Shifts</Text>
                        </View>
                    </View>

                    {/* CURRENT SHIFT CARD */}
                    <View style={styles.shiftCard}>
                        {/* Header Row */}
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Current Shift</Text>

                            {/* Status Indicator */}
                            <View style={styles.shiftBadge}>
                                <Ionicons
                                    name={currentShift?.shiftCategory === "DAY" ? "sunny" : "moon"}
                                    size={16}
                                    color="#fff"
                                />
                                <Text style={styles.shiftBadgeText}>
                                    {getShiftLabel(currentShift)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.details}>

                            {/* Location Info */}
                            <View style={styles.detailRow}>
                                <View style={styles.detailIconContainer}>
                                    <Ionicons name="location-outline" size={20} color="#c01313" />
                                </View>
                                <View style={styles.detailText}>
                                    <Text style={styles.detailLabel}>Location</Text>
                                    <Text style={styles.detailValue}>{location}</Text>
                                </View>
                            </View>

                            {/* Time Info */}
                            <View style={styles.detailRow}>
                                <View style={styles.detailIconContainer}>
                                    <Ionicons name="time-outline" size={20} color="#6366F1" />
                                </View>
                                <View style={styles.detailText}>
                                    <Text style={styles.detailLabel}>Shift Time</Text>
                                    <Text style={styles.detailValue}>{shiftTime}</Text>
                                </View>
                            </View>


                            {/* Action Button */}
                            <TouchableOpacity
                                onPress={() => {
                                    resetModalState();
                                    if (isCheckedIn) {
                                        setShowCheckOutModal(true);
                                    } else {
                                        setShowCheckInModal(true);
                                    }
                                }}
                                style={[
                                    styles.primaryButton,
                                    isCheckedIn ? styles.checkoutButton : styles.checkinButton
                                ]}
                                activeOpacity={0.9}
                            >
                                <Text style={styles.primaryButtonText}>
                                    {isCheckedIn ? 'Check Out' : 'Check In'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* WEEKLY HOURS CARD */}
                    <View style={styles.quickInfoCard}>
                        <Text style={styles.quickInfoTitle}>Weekly Summary</Text>

                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Total Hours</Text>
                            <Text style={styles.infoValue}>
                                {formatDuration(weeklyStats.totalMinutes)} /
                                {formatDuration(weeklyStats.weeklyLimitMinutes)}
                            </Text>
                        </View>

                        <View style={styles.infoItemDivider} />

                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Overtime Hours</Text>
                            <Text
                                style={[
                                    styles.infoValue,
                                    { color: weeklyStats.overtimeMinutes > 0 ? '#10B981' : '#1F2937' }
                                ]}
                            >
                                {formatDuration(weeklyStats.overtimeMinutes)}
                            </Text>
                        </View>

                        <View style={styles.infoItemDivider} />

                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Remaining</Text>
                            <Text style={styles.infoValue}>
                                {formatDuration(weeklyStats.remainingMinutes)}
                            </Text>
                        </View>
                    </View>

                    <View style={{ height: 100 }} />

                </View>
            </ScrollView>
            {/* check in modal */}
            <Modal
                visible={showCheckInModal}
                transparent
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Confirm Check In</Text>
                        <Text style={styles.modalText}>
                            Are you sure you want to check in?
                        </Text>
                        {modalError && (
                            <Text style={{ color: '#EF4444', marginBottom: 12 }}>
                                {modalError}
                            </Text>
                        )}

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => {
                                    resetModalState();
                                    setShowCheckInModal(false);
                                }}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.confirmButton,
                                    modalLoading && { opacity: 0.6 }
                                ]}
                                onPress={confirmCheckIn}
                                disabled={modalLoading}
                            >
                                {modalLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : modalSuccess ? (
                                    <Ionicons name="checkmark-circle" size={22} color="#16e77b" />
                                ) : (
                                    <Text style={styles.confirmText}>Confirm</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </Modal>

            {/* check out modal */}
            <Modal
                visible={showCheckOutModal}
                transparent
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Confirm Check Out</Text>
                        <Text style={styles.modalText}>
                            Are you sure you want to check out?
                        </Text>

                        {modalError && (
                            <Text style={{ color: '#EF4444', marginBottom: 12 }}>
                                {modalError}
                            </Text>
                        )}

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => {
                                    resetModalState();
                                    setShowCheckOutModal(false);
                                }}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.confirmButton,
                                    modalLoading && { opacity: 0.6 }
                                ]}
                                onPress={confirmCheckOut}
                                disabled={modalLoading}
                            >
                                {modalLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.confirmText}>Confirm</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f3ff',
    },
    scrollContent: {
        flexGrow: 1,
    },

    // CONTENT
    content: {
        padding: 20,
    },

     // HEADER
    heroHeader: {
        backgroundColor: '#6B46C1',
        paddingTop: 40,
        paddingBottom: 40,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    menuButton: {
        width: 24,
        height: 24,
        marginBottom: 16,
    },
    menuLine: {
        width: 24,
        height: 2,
        backgroundColor: '#ffffff',
        borderRadius: 2,
        marginBottom: 5,
    },
    dashboardTitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 10,
    },
    userHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.3)',
        backgroundColor: '#E0E7FF',
    },
    greeting: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 3,
    },
    name: {
        fontSize: 28,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 3,
    },
    date: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
    },

    // STATS ROW
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },

    statCard: {
        width: '31%',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },

    statLabel: {
        fontSize: 11,
        color: '#6B7280',
    },
    statIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 2,
    },

    // SHIFT CARD
    shiftCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        paddingBottom: 10
    },
    statusPill: {
        backgroundColor: '#DBEAFE',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusPillText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1E40AF',
    },

    // DETAIL ROWS
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 14,
    },
    detailIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    detailText: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 15,
        color: '#1F2937',
        fontWeight: '500',
    },
    details: {
        gap: 10
    },

    // STATUS INDICATOR
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 16,
        marginBottom: 16,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
    },
    shiftBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#6366F1',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 16,
    },

    shiftBadgeText: {
        color: '#fff',
        marginLeft: 6,
        fontSize: 13,
        fontWeight: '600',
    },

    // PRIMARY BUTTON
    primaryButton: {
        backgroundColor: '#10B981',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        // shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    primaryButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    checkinButton: {
        backgroundColor: '#10B981', // green
    },

    checkoutButton: {
        backgroundColor: '#EF4444', // red
    },

    // QUICK INFO CARD
    quickInfoCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 4,
    },
    quickInfoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 16,
    },
    infoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    infoItemDivider: {
        height: 1,
        backgroundColor: '#F3F4F6',
    },
    infoLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    infoValue: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: '500',
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
        backgroundColor: '#6930b5',
    },

    confirmText: {
        color: '#fff',
        fontWeight: '600',
    },
});