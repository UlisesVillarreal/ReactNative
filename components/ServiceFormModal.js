import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function ServiceFormModal({ 
    visible, 
    onClose, 
    onSave, 
    isEditing, 
    formEmpleado, 
    setFormEmpleado, 
    formServicio, 
    setFormServicio, 
    formMonto, 
    setFormMonto, 
    submitted, 
    errorMsg, 
    loading, 
    amountRegex, 
    viewMode = false, 
    selectedService = null, 
    onCloseView
}) {
    const [empModalVisible, setEmpModalVisible] = useState(false);
    const [servModalVisible, setServModalVisible] = useState(false);
    
    const listaEmpleados = [
        "Estela Lopez",
        "Lucía Fernández",
        "Valentina Ruiz",
        "Micaela Guzman",
        "Sofía Martínez"
    ];
    
    const listaServicios = [
        "Depilación Láser Definitiva",
        "Limpieza Facial Profunda",
        "Masaje Descontracturante",
        "Uñas Soft Gel",
        "Radiofrecuencia Facial"
    ];

    return (
        <>
            {/* 1. MODAL DE CREAR / EDITAR */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={visible && !viewMode}
                onRequestClose={onClose}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={styles.modalContentLarge}>
                        <Text style={styles.modalMainTitle}>{isEditing ? 'Editar Servicio' : 'Registrar Servicio Realizado'}</Text>
                        <Text style={styles.modalSubtitle}>Seleccione los datos de la atención realizada</Text>

                        {/* SELECCIÓN DE EMPLEADO */}
                        <Text style={styles.label}>Empleado</Text>
                        <TouchableOpacity 
                            style={[
                                styles.selectButtonModal, 
                                submitted && (!formEmpleado ? styles.inputError : styles.inputSuccess)
                            ]}
                            onPress={() => setEmpModalVisible(true)}
                        >
                            <Text style={[styles.selectButtonText, !formEmpleado && { color: '#9A8478' }]}>
                                {formEmpleado || "Seleccione un empleado..."}
                            </Text>
                            <FontAwesome name="angle-down" size={16} color="#6D512A" />
                        </TouchableOpacity>
                        {submitted && !formEmpleado && (
                            <Text style={styles.fieldErrorText}>Seleccione un empleado.</Text>
                        )}

                        {/* SELECCIÓN DE TIPO DE SERVICIO */}
                        <Text style={styles.label}>Tipo de servicio</Text>
                        <TouchableOpacity 
                            style={[
                                styles.selectButtonModal, 
                                submitted && (!formServicio ? styles.inputError : styles.inputSuccess)
                            ]}
                            onPress={() => setServModalVisible(true)}
                        >
                            <Text style={[styles.selectButtonText, !formServicio && { color: '#9A8478' }]}>
                                {formServicio || "Seleccione un servicio..."}
                            </Text>
                            <FontAwesome name="angle-down" size={16} color="#6D512A" />
                        </TouchableOpacity>
                        {submitted && !formServicio && (
                            <Text style={styles.fieldErrorText}>Seleccione un tipo de servicio.</Text>
                        )}

                        {/* MONTO */}
                        <Text style={styles.label}>Monto ($ - Solo números)</Text>
                        <View style={[
                            styles.inputContainerModal, 
                            submitted && (!formMonto.trim() || !amountRegex.test(formMonto) ? styles.inputError : styles.inputSuccess)
                        ]}>
                            <TextInput 
                                style={styles.input} 
                                placeholder="Ej: 26000" 
                                placeholderTextColor="#9A8478" 
                                keyboardType="numeric" 
                                value={formMonto} 
                                onChangeText={(text) => setFormMonto(text.replace(/[^0-9]/g, ''))} 
                                maxLength={7}
                            />
                        </View>
                        {submitted && (!formMonto.trim() || !amountRegex.test(formMonto)) && (
                            <Text style={styles.fieldErrorText}>Ingrese un monto válido en números.</Text>
                        )}

                        {/* Mensaje general de error */}
                        {errorMsg ? <Text style={styles.errorTextGeneral}>{errorMsg}</Text> : null}

                        {/* Botón Guardar */}
                        <TouchableOpacity style={styles.modalButtonSend} onPress={onSave} disabled={loading}>
                            {loading ? <ActivityIndicator color="#FBF7F0" size="small" /> : <Text style={styles.modalButtonSendText}>Guardar</Text>}
                        </TouchableOpacity>

                        {/* Botón Cancelar */}
                        <TouchableOpacity style={styles.modalButtonSecondary} onPress={onClose} disabled={loading}>
                            <Text style={styles.modalButtonSecondaryText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>

                {/* MODAL INTERNO PARA SELECCIONAR EMPLEADO */}
                <Modal visible={empModalVisible} transparent={true} animationType="fade">
                    <View style={styles.subModalOverlay}>
                        <View style={styles.subModalContent}>
                            <Text style={styles.subModalTitle}>Seleccione Empleado</Text>
                            <FlatList
                                data={listaEmpleados}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity 
                                        style={styles.subModalItem} 
                                        onPress={() => { setFormEmpleado(item); setEmpModalVisible(false); }}
                                    >
                                        <Text style={styles.subModalItemText}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                            <TouchableOpacity style={styles.subModalCloseBtn} onPress={() => setEmpModalVisible(false)}>
                                <Text style={styles.subModalCloseText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* MODAL INTERNO PARA SELECCIONAR SERVICIO */}
                <Modal visible={servModalVisible} transparent={true} animationType="fade">
                    <View style={styles.subModalOverlay}>
                        <View style={styles.subModalContent}>
                            <Text style={styles.subModalTitle}>Seleccione Servicio</Text>
                            <FlatList
                                data={listaServicios}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity 
                                        style={styles.subModalItem} 
                                        onPress={() => { setFormServicio(item); setServModalVisible(false); }}
                                    >
                                        <Text style={styles.subModalItemText}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                            <TouchableOpacity style={styles.subModalCloseBtn} onPress={() => setServModalVisible(false)}>
                                <Text style={styles.subModalCloseText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </Modal>

            {/* 2. MODAL DE VER DETALLE */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={viewMode}
                onRequestClose={onCloseView}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContentLarge}>
                        <Text style={styles.modalMainTitle}>Detalle del Servicio</Text>
                        
                        {selectedService && (
                            <View style={styles.viewDetailContainer}>
                                <Text style={styles.label}>Empleado</Text>
                                <View style={styles.viewDisplayBox}>
                                    <Text style={styles.viewDisplayText}>{selectedService.empleado}</Text>
                                </View>

                                <Text style={styles.label}>Tipo de servicio</Text>
                                <View style={styles.viewDisplayBox}>
                                    <Text style={styles.viewDisplayText}>{selectedService.servicio}</Text>
                                </View>

                                <Text style={styles.label}>Monto</Text>
                                <View style={styles.viewDisplayBox}>
                                    <Text style={styles.viewDisplayText}>{selectedService.monto}</Text>
                                </View>

                                <Text style={styles.label}>Fecha y Hora</Text>
                                <View style={styles.viewDisplayBox}>
                                    <Text style={styles.viewDisplayText}>{selectedService.fecha || 'No registrada'} - {selectedService.hora || 'No registrada'}</Text>
                                </View>
                            </View>
                        )}

                        <TouchableOpacity style={styles.modalButtonSend} onPress={onCloseView}>
                            <Text style={styles.modalButtonSendText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
},
modalContentLarge: {
    backgroundColor: '#F2E3C8',
    borderRadius: 24,
    padding: 20,
    width: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
},
modalMainTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#6D512A',
    marginBottom: 4,
    textAlign: 'center',
},
modalSubtitle: {
    fontSize: 12.5,
    color: '#7C6860',
    textAlign: 'center',
    marginBottom: 14,
},
label: {
    color: '#6D512A',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
},
input: {
    fontSize: 14,
    color: '#332211',
    height: 40,
    flex: 1,
},
inputContainerModal: {
    borderWidth: 1.5,
    paddingHorizontal: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#D4B279',
    width: '100%',
    backgroundColor: '#FFF',
    minHeight: 46,
},
selectButtonModal: {
    borderWidth: 1.5,
    paddingHorizontal: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: '#D4B279',
    width: '100%',
    backgroundColor: '#FFF',
    minHeight: 46,
},
selectButtonText: {
    fontSize: 14,
    color: '#332211',
},
inputError: { 
    borderColor: '#D32F2F' 
},
inputSuccess: { 
    borderColor: '#2E7D32' 
},
fieldErrorText: {
    color: '#D32F2F',
    fontSize: 11.5,
    marginTop: 3,
    marginLeft: 4,
    alignSelf: 'flex-start',
    fontWeight: '600',
},
errorTextGeneral: {
    color: '#D32F2F',
    backgroundColor: '#FDECEA',
    padding: 8,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 12,
    marginTop: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: '#F5C6CB',
},
modalButtonSend: {
    backgroundColor: '#C68A36',
    paddingVertical: 12,
    width: 150,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 10,
    minHeight: 46,
    justifyContent: 'center',
},
modalButtonSendText: { 
    color: '#FBF7F0', 
    fontSize: 15, 
    fontWeight: 'bold' 
},
modalButtonSecondary: {
    backgroundColor: '#8C7360',
    paddingVertical: 12,
    width: 150,
    borderRadius: 14,
    alignItems: 'center',
    minHeight: 46,
    justifyContent: 'center',
},
modalButtonSecondaryText: {
    color: '#FFF', 
    fontSize: 15, 
    fontWeight: 'bold' 
},
subModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
},
subModalContent: {
    backgroundColor: '#F2E3C8',
    width: '80%',
    borderRadius: 20,
    padding: 20,
    maxHeight: '60%',
},
subModalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6D512A',
    marginBottom: 12,
    textAlign: 'center',
},
subModalItem: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#D4B279',
},
subModalItemText: {
    fontSize: 14,
    color: '#332211',
    textAlign: 'center',
},
subModalCloseBtn: {
    backgroundColor: '#8C7360',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
},
subModalCloseText: {
    color: '#FFF',
    fontWeight: 'bold',
},
viewDetailContainer: {
    width: '100%',
    marginVertical: 5,
},
viewDisplayBox: {
    borderWidth: 1.5,
    paddingHorizontal: 14,
    borderRadius: 14,
    justifyContent: 'center',
    borderColor: '#D4B279',
    width: '100%',
    backgroundColor: '#FFF',
    minHeight: 42,
    marginBottom: 6,
},
viewDisplayText: {
    fontSize: 14,
    color: '#332211',
},
});