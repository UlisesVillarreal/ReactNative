import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Modal, ImageBackground, Dimensions, Alert } from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
// Firebase Firestore
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../src/config/firebaseConfig';
// Componentes
import ServiceFormModal from '../components/ServiceFormModal';

const { height, width } = Dimensions.get('window');

export default function Services() {
    const [services, setServices] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Estados de modales y edición
    const [registerModalVisible, setRegisterModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false); 
    const [isEditing, setIsEditing] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    // Modal de confirmación institucional unificado (para Crear, Editar y Eliminar)
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [confirmTitle, setConfirmTitle] = useState('');
    const [confirmSubtitle, setConfirmSubtitle] = useState('');
    const [confirmAction, setConfirmAction] = useState(null);

    // Campos seleccionados en el formulario
    const [formEmpleado, setFormEmpleado] = useState('');
    const [formServicio, setFormServicio] = useState('');
    const [formMonto, setFormMonto] = useState('');
    
    const [submitted, setSubmitted] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const amountRegex = /^[0-9]+$/;

    const getCurrentDateTime = () => {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return { fecha: `${day}/${month}/${year}`, hora: `${hours}:${minutes}` };
    };

    // Lectura en tiempo real con Firebase
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'servicios'), (querySnapshot) => {
            const lista = [];
            querySnapshot.forEach((documento) => {
                lista.push({ id: documento.id, ...documento.data() });
            });
            // Más recientes primero (los registros viejos sin marca de tiempo van al final)
            lista.sort((a, b) => (b.creadoEn?.toMillis?.() ?? 0) - (a.creadoEn?.toMillis?.() ?? 0));
            setServices(lista);
        }, () => {
            Alert.alert('Error', 'No se pudieron cargar los servicios. Verifique su conexión o sus permisos.');
        });

        return () => unsubscribe();
    }, []);

    const filteredServices = services.filter((item) => 
        (item.empleado && item.empleado.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.servicio && item.servicio.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Guardar o Actualizar directamente en Firebase al hacer clic en Guardar en el formulario
    const handleSaveService = async () => {
        setSubmitted(true);

        if (!formEmpleado || !formServicio || !formMonto.trim() || !amountRegex.test(formMonto)) {
            setErrorMsg('Por favor, seleccione el empleado, el servicio y complete un monto válido.');
            return;
        }

        setErrorMsg('');
        const montoNumero = Number(formMonto);
        const formattedAmount = `$${montoNumero.toLocaleString('es-AR')}`;
        const { fecha, hora } = getCurrentDateTime();

        setLoading(true);
        try {
            if (isEditing && selectedService) {
                // Al editar se conservan la fecha y hora originales del registro
                const docRef = doc(db, 'servicios', selectedService.id);
                await updateDoc(docRef, {
                    empleado: formEmpleado,
                    servicio: formServicio,
                    monto: formattedAmount,
                    montoNumero: montoNumero,
                });
            } else {
                await addDoc(collection(db, 'servicios'), {
                    empleado: formEmpleado,
                    servicio: formServicio,
                    monto: formattedAmount,
                    montoNumero: montoNumero,
                    fecha: fecha,
                    hora: hora,
                    creadoEn: serverTimestamp(),
                    creadoPor: auth.currentUser?.uid ?? null,
                });
            }
            setRegisterModalVisible(false);
        } catch (error) {
            setErrorMsg("No se pudo guardar el registro. Verifique su conexión o sus permisos.");
        } finally {
            setLoading(false); 
        }
    };

    // Botón Registrar nuevo servicio
    const handleOpenCreate = () => {
        setConfirmTitle("¿Desea agregar un nuevo registro de servicio?");
        setConfirmSubtitle("A continuación podrá completar los datos de la atención realizada.");
        setConfirmAction(() => () => {
            setConfirmModalVisible(false);
            setIsEditing(false);
            setFormEmpleado('');
            setFormServicio('');
            setFormMonto('');
            setSubmitted(false);
            setErrorMsg('');
            setRegisterModalVisible(true);
        });
        setConfirmModalVisible(true);
    };

    // Botón Editar
    const handleOpenEdit = (item) => {
        setConfirmTitle("¿Desea modificar este registro de servicio?");
        setConfirmSubtitle("Se actualizarán los datos de la atención realizada.");
        setConfirmAction(() => () => {
            setConfirmModalVisible(false);
            setSelectedService(item);
            setIsEditing(true);
            setFormEmpleado(item.empleado);
            setFormServicio(item.servicio);
            setFormMonto(item.monto.replace(/\D/g, ''));
            setSubmitted(false);
            setErrorMsg('');
            setRegisterModalVisible(true);
        });
        setConfirmModalVisible(true);
    };

    const handleOpenView = (item) => {
        setSelectedService(item);
        setViewModalVisible(true);
    };

    // Botón Eliminar
    const handleDeleteService = (id) => {
        setConfirmTitle("¿Desea eliminar este registro de servicio?");
        setConfirmSubtitle("Esta acción no se puede deshacer y borrará el registro.");
        setConfirmAction(() => async () => {
            setConfirmModalVisible(false);
            try {
                await deleteDoc(doc(db, 'servicios', id));
            } catch (error) {
                Alert.alert('Error', 'No se pudo eliminar el registro. Es posible que no tenga permisos para hacerlo.');
            }
        });
        setConfirmModalVisible(true);
    };

    return (
        <View style={styles.container}>

            <ImageBackground
                source={require('../assets/fonoperfil.jpeg')} 
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                {/* Espacio superior */}
                <View style={styles.navbar} />

                <View style={styles.contentWrapper}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Servicios Realizados</Text>
                        <Text style={styles.subtitle}>Registro y seguimiento de cada atención</Text>
                    </View>

                    {/* Buscador general */}
                    <View style={styles.searchContainer}>
                        <FontAwesome name="search" size={16} color="#B88A3B" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar por empleado o servicio"
                            placeholderTextColor="#9A8478"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    {/* Botón Registrar */}
                    <TouchableOpacity style={styles.registerButton} onPress={handleOpenCreate}>
                        <Text style={styles.registerButtonText}>+ Registrar nuevo servicio realizado</Text>
                    </TouchableOpacity>

                    <View style={styles.listHeaderRow}>
                        <Text style={styles.sectionTitle}>Últimos servicios</Text>
                        <Text style={styles.counterText}>{filteredServices.length} registros</Text>
                    </View>

                    <FlatList
                        data={filteredServices}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <View style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardEmployee}>{item.empleado}</Text>
                                    <Text style={styles.cardPrice}>{item.monto}</Text>
                                </View>
                                <Text style={styles.cardService}>{item.servicio}</Text>
                                
                                <View style={styles.divider} />

                                {/* Botones de Acción: Ver, Editar, Eliminar */}
                                <View style={styles.actionsRow}>
                                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleOpenView(item)}>
                                        <FontAwesome name="eye" size={14} color="#B88A3B" style={styles.actionIcon} />
                                        <Text style={styles.actionTextVer}>Ver</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleOpenEdit(item)}>
                                        <FontAwesome5 name="pen" size={13} color="#3A75C4" style={styles.actionIcon} />
                                        <Text style={styles.actionTextEditar}>Editar</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeleteService(item.id)}>
                                        <FontAwesome name="trash" size={14} color="#D32F2F" style={styles.actionIcon} />
                                        <Text style={styles.actionTextEliminar}>Eliminar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    />
                </View>
            </ImageBackground>

            {/* Componente Modal del Formulario */}
            <ServiceFormModal 
                visible={registerModalVisible}
                onClose={() => setRegisterModalVisible(false)}
                onSave={handleSaveService}
                isEditing={isEditing}
                formEmpleado={formEmpleado}
                setFormEmpleado={setFormEmpleado}
                formServicio={formServicio}
                setFormServicio={setFormServicio}
                formMonto={formMonto}
                setFormMonto={setFormMonto}
                submitted={submitted}
                errorMsg={errorMsg}
                loading={loading}
                amountRegex={amountRegex}
                viewMode={viewModalVisible}
                selectedService={selectedService}
                onCloseView={() => setViewModalVisible(false)}
            />

            {/* Modal de Confirmación Institucional Compartido */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={confirmModalVisible}
                onRequestClose={() => setConfirmModalVisible(false)}
            >
                <View style={styles.customModalOverlay}>
                    <View style={styles.customModalBox}>
                        <Text style={styles.customModalTitle}>{confirmTitle}</Text>
                        <Text style={styles.customModalSubtitle}>{confirmSubtitle}</Text>

                        <View style={styles.customModalButtonRow}>
                            <TouchableOpacity 
                                style={styles.customCancelBtn} 
                                onPress={() => setConfirmModalVisible(false)}
                            >
                                <Text style={styles.customCancelText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.customContinueBtn} 
                                onPress={confirmAction}
                            >
                                <Text style={styles.customContinueText}>Continuar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#FBEBD7', 
},
backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
},
navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 40,
    paddingBottom: 0,
    backgroundColor: 'transparent',
},
contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 100,
},
header: { 
    alignItems: 'flex-start', 
    marginBottom: 16, 
    width: '100%' 
},
title: { 
    fontSize: 24,
    color: '#6D512A', 
    fontFamily: 'PlayfairDisplay_700Bold', 
    marginBottom: 2
},
subtitle: { 
    color: '#7C6860',
    fontSize: 13,
    fontFamily: 'PlayfairDisplay_700Bold',
},
searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    borderWidth: 1.2, 
    borderColor: '#D4B279', 
    borderRadius: 16, 
    paddingHorizontal: 14, 
    height: 48, 
    marginBottom: 12 
},
searchIcon: { 
    marginRight: 10 
},
searchInput: { 
    flex: 1, 
    fontSize: 14, 
    color: '#332211'
},
registerButton: { 
    backgroundColor: '#C68A36', 
    borderRadius: 16, 
    height: 48, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 16, 
    elevation: 3 
},
registerButtonText: { 
    color: '#FBF7F0', 
    fontSize: 15, 
    fontWeight: 'bold' 
},
listHeaderRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 10, 
    paddingHorizontal: 4
},
sectionTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#6D512A' 
},
counterText: { 
    fontSize: 12, 
    color: '#7C6860', 
    fontWeight: '600' 
},
listContainer: { 
    paddingBottom: 20 
},
card: { 
    backgroundColor: '#F2E3C8', 
    borderRadius: 20, 
    padding: 16, 
    marginBottom: 14, 
    elevation: 4
},
cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 2 
},
cardEmployee: { 
    fontSize: 15, 
    fontWeight: 'bold', 
    color: '#6D512A' 
},
cardPrice: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#6D512A' 
},
cardService: { 
    fontSize: 13, 
    color: '#7C6860', 
    marginBottom: 12 
},
divider: { 
    height: 1, 
    backgroundColor: '#E5D3B3', 
    marginBottom: 10 
},
actionsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center' 
},
actionBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 4, 
    paddingHorizontal: 8 
},
actionIcon: { 
    marginRight: 5 
},
actionTextVer: { 
    fontSize: 13, 
    color: '#B88A3B', 
    fontWeight: '600' 
},
actionTextEditar: { 
    fontSize: 13, 
    color: '#3A75C4', 
    fontWeight: '600' 
},
actionTextEliminar: { 
    fontSize: 13, 
    color: '#D32F2F', 
    fontWeight: '600' 
},

// Estilos del Modal de Confirmación Institucional
customModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
},
customModalBox: {
    backgroundColor: '#F2E3C8',
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxWidth: 360,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
},
customModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A3B32',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 26,
},
customModalSubtitle: {
    fontSize: 14,
    color: '#7C6860',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
},
customModalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
},
customCancelBtn: {
    flex: 1,
    backgroundColor: '#7A6B62',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
},
customCancelText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
},
customContinueBtn: {
    flex: 1,
    backgroundColor: '#D49B37',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
},
customContinueText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
},
});