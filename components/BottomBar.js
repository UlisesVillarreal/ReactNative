import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { signOut } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';

// Barra inferior fija: Perfil (inicio), Servicios realizados y Cerrar sesión.
// Se renderiza una sola vez fuera de las pantallas, por eso no se mueve al cambiar de pantalla.
// active: 'Home' | 'Services' (resalta la pestaña actual)
// onNavigate: (nombreDePantalla) => void
export default function BottomBar({ active, onNavigate }) {
    const insets = useSafeAreaInsets();
    const [logoutVisible, setLogoutVisible] = useState(false);

    const confirmLogout = async () => {
        setLogoutVisible(false);
        try {
            await signOut(auth);
        } catch (error) {
            Alert.alert('Error', 'No se pudo cerrar la sesión.');
        }
    };

    const items = [
        { key: 'Home', label: 'Perfil', icon: 'account-circle-outline', onPress: () => onNavigate('Home') },
        { key: 'Services', label: 'Servicios', icon: 'spa-outline', onPress: () => onNavigate('Services') },
        { key: 'Logout', label: 'Cerrar sesión', icon: 'logout', onPress: () => setLogoutVisible(true), danger: true },
    ];

    return (
        <>
            <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
                {items.map((item) => {
                    const isActive = item.key === active;
                    const color = item.danger ? '#B3392E' : isActive ? '#B88A3B' : '#6D512A';
                    return (
                        <TouchableOpacity
                            key={item.key}
                            style={styles.item}
                            onPress={item.onPress}
                            activeOpacity={0.7}
                            accessibilityRole="button"
                            accessibilityLabel={item.label}
                            accessibilityState={{ selected: isActive }}
                        >
                            <MaterialCommunityIcons name={item.icon} size={26} color={color} />
                            <Text style={[styles.label, { color }, isActive && styles.labelActive]}>
                                {item.label}
                            </Text>
                            {isActive && <View style={styles.indicator} />}
                        </TouchableOpacity>
                    );
                })}
            </View>

            <Modal
                animationType="fade"
                transparent={true}
                visible={logoutVisible}
                onRequestClose={() => setLogoutVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>¿Desea cerrar sesión?</Text>
                        <Text style={styles.modalSubtitle}>
                            Deberá iniciar sesión nuevamente para ingresar al sistema.
                        </Text>
                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setLogoutVisible(false)}>
                                <Text style={styles.cancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.continueBtn} onPress={confirmLogout}>
                                <Text style={styles.continueText}>Continuar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    bar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        backgroundColor: '#F2E3C8',
        borderTopWidth: 1,
        borderTopColor: '#E8D2B8',
        paddingTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 12,
    },
    item: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
    label: { fontSize: 11, marginTop: 2 },
    labelActive: { fontWeight: 'bold' },
    indicator: {
        position: 'absolute',
        top: -8,
        width: 36,
        height: 3,
        borderRadius: 2,
        backgroundColor: '#B88A3B',
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(50, 35, 20, 0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalBox: {
        backgroundColor: '#F2E3C8',
        borderRadius: 24,
        padding: 24,
        width: '90%',
        maxWidth: 360,
        alignItems: 'center',
        elevation: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4A3B32',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 26,
    },
    modalSubtitle: { fontSize: 14, color: '#7C6860', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
    modalButtonRow: { flexDirection: 'row', width: '100%', gap: 12 },
    cancelBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#B88A3B',
        alignItems: 'center',
    },
    cancelText: { color: '#6D512A', fontWeight: 'bold' },
    continueBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#B88A3B', alignItems: 'center' },
    continueText: { color: '#FBF1F0', fontWeight: 'bold' },
});
