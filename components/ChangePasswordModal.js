import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView,
    KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { getPasswordRequirements, getPasswordError } from '../src/utils/validators';

// Campo de contraseña con botón de ojo para mostrar/ocultar
function PasswordField({ label, value, onChangeText, error, placeholder = '********' }) {
    const [visible, setVisible] = useState(false);
    return (
        <>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.inputContainer, error ? styles.inputError : null]}>
                <FontAwesome name="lock" size={18} style={styles.icon} />
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#9A8478"
                    secureTextEntry={!visible}
                    autoCapitalize="none"
                    autoCorrect={false}
                    accessibilityLabel={label}
                />
                <TouchableOpacity
                    onPress={() => setVisible(!visible)}
                    accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                    <FontAwesome name={visible ? 'eye-slash' : 'eye'} size={18} style={styles.icon} />
                </TouchableOpacity>
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </>
    );
}

// Modal para cambiar la contraseña, en dos pasos (escribir -> confirmar).
// Firebase exige volver a autenticar con la contraseña actual antes de cambiarla.
export default function ChangePasswordModal({ visible, onClose }) {
    const [current, setCurrent] = useState('');
    const [next, setNext] = useState('');
    const [confirm, setConfirm] = useState('');
    const [step, setStep] = useState('edit');
    const [saving, setSaving] = useState(false);
    const [currentError, setCurrentError] = useState(''); // error que viene de Firebase (contraseña actual incorrecta)
    const [generalError, setGeneralError] = useState('');

    useEffect(() => {
        if (visible) {
            setCurrent('');
            setNext('');
            setConfirm('');
            setStep('edit');
            setSaving(false);
            setCurrentError('');
            setGeneralError('');
        }
    }, [visible]);

    // --- Validaciones (las mismas reglas que en el registro) ---
    const requirements = getPasswordRequirements(next);
    const allRequirementsMet = requirements.every((r) => r.met);

    let nextError = next.length > 0 ? getPasswordError(next) : '';
    if (!nextError && next.length > 0 && current && next === current) {
        nextError = 'La nueva contraseña debe ser distinta a la actual.';
    }
    const confirmError = confirm.length > 0 && next !== confirm ? 'Las contraseñas no coinciden.' : '';

    const canSave =
        current.length > 0 &&
        next.length > 0 && allRequirementsMet && !nextError &&
        confirm.length > 0 && !confirmError;

    const handleConfirm = async () => {
        const user = auth.currentUser;
        setSaving(true);
        setCurrentError('');
        setGeneralError('');
        try {
            // 1) Verificar que la contraseña actual sea correcta
            const credential = EmailAuthProvider.credential(user.email, current);
            await reauthenticateWithCredential(user, credential);
            // 2) Cambiarla
            await updatePassword(user, next);

            Alert.alert('Contraseña actualizada', 'Su contraseña fue modificada correctamente.');
            onClose();
        } catch (error) {
            setStep('edit');
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
                setCurrentError('La contraseña actual es incorrecta.');
            } else if (error.code === 'auth/too-many-requests') {
                setGeneralError('Se realizaron demasiados intentos. Espere unos minutos antes de volver a intentarlo.');
            } else if (error.code === 'auth/network-request-failed') {
                setGeneralError('Error de conexión, revise su internet.');
            } else if (error.code === 'auth/weak-password') {
                setGeneralError('La contraseña nueva es demasiado débil.');
            } else {
                setGeneralError('No se pudo cambiar la contraseña. Inténtelo nuevamente.');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal animationType="fade" transparent visible={visible} onRequestClose={saving ? undefined : onClose}>
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.box}>
                    {step === 'edit' ? (
                        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                            <Text style={styles.title}>Editar contraseña</Text>

                            <PasswordField
                                label="Contraseña actual"
                                value={current}
                                onChangeText={(t) => { setCurrent(t); setCurrentError(''); setGeneralError(''); }}
                                error={currentError}
                            />

                            <PasswordField
                                label="Nueva contraseña"
                                value={next}
                                onChangeText={setNext}
                                error={nextError}
                            />

                            {/* Lista dinámica de requisitos, igual que en el registro */}
                            <View style={styles.requirementsContainer}>
                                <Text style={styles.requirementsTitle}>Requisitos de la contraseña:</Text>
                                {requirements.map((r, index) => (
                                    <View key={index} style={styles.requirementRow}>
                                        <FontAwesome
                                            name={r.met ? 'check-circle' : 'times-circle'}
                                            size={16}
                                            color={r.met ? '#10B981' : '#D94A3D'}
                                        />
                                        <Text style={[styles.requirementText, { color: r.met ? '#10B981' : '#D94A3D' }]}>
                                            {r.label}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            <PasswordField
                                label="Repetir nueva contraseña"
                                value={confirm}
                                onChangeText={setConfirm}
                                error={confirmError}
                            />

                            {generalError ? <Text style={[styles.errorText, { marginTop: 10 }]}>{generalError}</Text> : null}

                            <View style={styles.buttonRow}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                                    <Text style={styles.cancelText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.primaryBtn, !canSave && styles.primaryBtnDisabled]}
                                    onPress={() => setStep('confirm')}
                                    disabled={!canSave}
                                >
                                    <Text style={styles.primaryText}>Guardar</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    ) : (
                        <>
                            <Text style={styles.title}>¿Está seguro que desea modificar la información?</Text>
                            <Text style={styles.subtitle}>Se cambiará su contraseña de acceso al sistema.</Text>

                            <View style={styles.buttonRow}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={() => setStep('edit')} disabled={saving}>
                                    <Text style={styles.cancelText}>Volver</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.primaryBtn} onPress={handleConfirm} disabled={saving}>
                                    {saving
                                        ? <ActivityIndicator color="#FBF1F0" size="small" />
                                        : <Text style={styles.primaryText}>Confirmar</Text>}
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(50, 35, 20, 0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    box: {
        backgroundColor: '#F2E3C8',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 380,
        maxHeight: '90%',
        elevation: 10,
    },
    title: {
        fontSize: 19,
        fontWeight: 'bold',
        color: '#4A3B32',
        textAlign: 'center',
        marginBottom: 14,
        lineHeight: 25,
    },
    subtitle: { fontSize: 14, color: '#7C6860', textAlign: 'center', marginBottom: 22, lineHeight: 20 },
    label: { color: '#6D512A', fontSize: 14, fontWeight: 'bold', marginTop: 10, marginBottom: 5 },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E8D2B8',
        borderRadius: 10,
        backgroundColor: '#FFFDFC',
        paddingHorizontal: 12,
        minHeight: 46,
    },
    inputError: { borderColor: '#D94A3D' },
    icon: { color: '#b88a3b', width: 25, textAlign: 'center' },
    input: { flex: 1, height: 44, paddingVertical: 0, color: '#332211' },
    errorText: { color: '#D94A3D', fontSize: 12, marginTop: 5 },
    requirementsContainer: { marginTop: 10, marginBottom: 2 },
    requirementsTitle: { fontSize: 12, color: '#6D512A', fontWeight: 'bold', marginBottom: 6 },
    requirementRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5, gap: 8 },
    requirementText: { fontSize: 12, flexShrink: 1 },
    buttonRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
    cancelBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#B88A3B',
        alignItems: 'center',
    },
    cancelText: { color: '#6D512A', fontWeight: 'bold' },
    primaryBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#B88A3B',
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryBtnDisabled: { backgroundColor: '#D8B77A80' },
    primaryText: { color: '#FBF1F0', fontWeight: 'bold' },
});
