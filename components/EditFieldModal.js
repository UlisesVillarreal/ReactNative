import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, Modal,
    KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { PROFILE_FIELDS } from '../src/utils/validators';

// Modal para editar UN campo del perfil, en dos pasos:
//   1) "edit":    se escribe el nuevo valor (con las mismas validaciones del registro)
//   2) "confirm": se pide confirmación antes de guardar
// Props:
//   visible, field ('nombre' | 'apellido' | 'dni' | 'telefono'), currentValue,
//   onClose(), onConfirm(nuevoValor) -> Promise (si falla, se muestra el error)
export default function EditFieldModal({ visible, field, currentValue, onClose, onConfirm }) {
    const config = PROFILE_FIELDS[field];

    const [value, setValue] = useState('');
    const [touched, setTouched] = useState(false);
    const [step, setStep] = useState('edit');
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    // Cada vez que se abre el modal (o cambia el campo) se parte del valor actual
    useEffect(() => {
        if (visible) {
            setValue(currentValue ?? '');
            setTouched(false);
            setStep('edit');
            setSaving(false);
            setSaveError('');
        }
    }, [visible, field]);

    if (!config) return null;

    const trimmed = value.trim();
    const error = config.validate(value);
    const unchanged = trimmed === (currentValue ?? '').trim();
    const canSave = !error && !unchanged;

    const handleConfirm = async () => {
        setSaving(true);
        setSaveError('');
        try {
            await onConfirm(trimmed);
            onClose();
        } catch (e) {
            setSaveError('No se pudo guardar el cambio. Verifique su conexión e inténtelo nuevamente.');
            setStep('edit');
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
                        <>
                            <Text style={styles.title}>Editar {config.label.toLowerCase()}</Text>

                            <View style={[styles.inputContainer, touched && error ? styles.inputError : null]}>
                                <TextInput
                                    style={styles.input}
                                    value={value}
                                    placeholder={config.placeholder}
                                    placeholderTextColor="#9A8478"
                                    keyboardType={config.keyboardType}
                                    autoCapitalize={config.keyboardType === 'default' ? 'words' : 'none'}
                                    autoCorrect={false}
                                    autoFocus
                                    onChangeText={(t) => {
                                        setValue(config.sanitize(t));
                                        setTouched(true);
                                        setSaveError('');
                                    }}
                                    accessibilityLabel={`Nuevo valor de ${config.label}`}
                                />
                            </View>

                            {touched && error ? <Text style={styles.errorText}>{error}</Text> : null}
                            {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}

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
                        </>
                    ) : (
                        <>
                            <Text style={styles.title}>¿Está seguro que desea modificar la información?</Text>
                            <Text style={styles.subtitle}>
                                Se actualizará su {config.label.toLowerCase()}
                                {trimmed ? ` a "${trimmed}".` : ' y quedará vacío.'}
                            </Text>

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
        elevation: 10,
    },
    title: {
        fontSize: 19,
        fontWeight: 'bold',
        color: '#4A3B32',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 25,
    },
    subtitle: {
        fontSize: 14,
        color: '#7C6860',
        textAlign: 'center',
        marginBottom: 22,
        lineHeight: 20,
    },
    inputContainer: {
        borderWidth: 1,
        borderColor: '#E8D2B8',
        borderRadius: 10,
        backgroundColor: '#FFFDFC',
        paddingHorizontal: 12,
        minHeight: 48,
        justifyContent: 'center',
    },
    inputError: { borderColor: '#D94A3D' },
    input: { height: 46, paddingVertical: 0, color: '#332211' },
    errorText: { color: '#D94A3D', fontSize: 12, marginTop: 6 },
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
