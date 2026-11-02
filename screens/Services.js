    import React, { useState } from 'react';
    import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, FlatList, Modal, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
    import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

    export default function Servicios({ navigation }) {
    // Estado del listado de servicios
    const [services, setServices] = useState([
        { id: '1', empleado: 'Estela Lopez', servicio: 'Depilación Láser Definitiva', monto: '$18.000', fecha: '06/10/2026', hora: '09:30' },
        { id: '2', empleado: 'Lucía Fernández', servicio: 'Limpieza Facial Profunda', monto: '$24.000', fecha: '06/10/2026', hora: '10:45' },
        { id: '3', empleado: 'Valentina Ruiz', servicio: 'Masaje Descontracturante', monto: '$22.000', fecha: '05/10/2026', hora: '15:00' },
        { id: '4', empleado: 'Micaela Guzman', servicio: 'Uñas Soft Gel', monto: '$20.000', fecha: '05/10/2026', hora: '17:15' },
    ]);

    const [searchQuery, setSearchQuery] = useState('');

    // Estados para los Modales
    const [confirmRegisterModalVisible, setConfirmRegisterModalVisible] = useState(false);
    const [registerModalVisible, setRegisterModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    // Elemento seleccionado para Ver, Editar o Eliminar
    const [selectedService, setSelectedService] = useState(null);

    // Estados temporales para los formularios en los modales
    const [formEmpleado, setFormEmpleado] = useState('');
    const [formServicio, setFormServicio] = useState('');
    const [formMonto, setFormMonto] = useState('');
    
    // Estados para controlar errores y envíos
    const [submitted, setSubmitted] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);

    // EXPRESIONES REGULARES (REGEX) Y FILTROS
    const amountRegex = /^[0-9]+$/;
    
    // Función para permitir solo letras, acentos, eñes y espacios
    const handleTextOnlyChange = (text, setter) => {
        const filteredText = text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        setter(filteredText);
    };

    // Función auxiliar para obtener fecha y hora actual formateada
    const getCurrentDateTime = () => {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        return {
        fecha: `${day}/${month}/${year}`,
        hora: `${hours}:${minutes}`
        };
    };

    // Filtrar servicios con includes
    const filteredServices = services.filter((item) => 
        item.empleado.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.servicio.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- ACCIONES DE REGISTRO ---
    const handleOpenRegisterConfirm = () => {
        setConfirmRegisterModalVisible(true);
    };

    const handleProceedToRegisterForm = () => {
        setConfirmRegisterModalVisible(false);
        setFormEmpleado('');
        setFormServicio('');
        setFormMonto('');
        setSubmitted(false);
        setErrorMsg('');
        setRegisterModalVisible(true);
    };

    const handleSaveNewService = () => {
        setSubmitted(true);
        const cleanEmpleado = formEmpleado.trim();
        const cleanServicio = formServicio.trim();
        const cleanMonto = formMonto.trim();

        if (!cleanEmpleado || !cleanServicio || !cleanMonto || !amountRegex.test(cleanMonto)) {
        setErrorMsg('Por favor, complete todos los campos.');
        return;
        }

        setErrorMsg('');
        const formattedAmount = `$${Number(cleanMonto).toLocaleString('es-AR')}`;
        const { fecha, hora } = getCurrentDateTime();

        setLoading(true);
        setTimeout(() => {
        const nuevo = {
            id: Date.now().toString(),
            empleado: cleanEmpleado,
            servicio: cleanServicio,
            monto: formattedAmount,
            fecha: fecha,
            hora: hora
        };
        setServices([nuevo, ...services]);
        setLoading(false);
        setRegisterModalVisible(false);
        }, 600);
    };

    // --- ACCIONES DE VER ---
    const handleOpenView = (item) => {
        setSelectedService(item);
        setViewModalVisible(true);
    };

    // --- ACCIONES DE EDITAR ---
    const handleOpenEdit = (item) => {
        setSelectedService(item);
        setFormEmpleado(item.empleado);
        setFormServicio(item.servicio);
        setFormMonto(item.monto.replace(/\D/g, ''));
        setSubmitted(false);
        setErrorMsg('');
        setEditModalVisible(true);
    };

    const handleUpdateService = () => {
        setSubmitted(true);
        const cleanEmpleado = formEmpleado.trim();
        const cleanServicio = formServicio.trim();
        const cleanMonto = formMonto.trim();

        if (!cleanEmpleado || !cleanServicio || !cleanMonto || !amountRegex.test(cleanMonto)) {
        setErrorMsg('Por favor, complete todos los campos obligatorios.');
        return;
        }

        setErrorMsg('');
        const formattedAmount = `$${Number(cleanMonto).toLocaleString('es-AR')}`;
        const { fecha, hora } = getCurrentDateTime();

        setLoading(true);
        setTimeout(() => {
        const updatedList = services.map((item) => {
            if (item.id === selectedService.id) {
            return {
                ...item,
                empleado: cleanEmpleado,
                servicio: cleanServicio,
                monto: formattedAmount,
                fecha: fecha,
                hora: hora
            };
            }
            return item;
        });
        setServices(updatedList);
        setLoading(false);
        setEditModalVisible(false);
        }, 600);
    };

    // --- ACCIONES DE ELIMINAR ---
    const handleOpenDelete = (item) => {
        setSelectedService(item);
        setDeleteModalVisible(true);
    };

    const handleDeleteService = () => {
        setLoading(true);
        setTimeout(() => {
        setServices(services.filter((item) => item.id !== selectedService.id));
        setLoading(false);
        setDeleteModalVisible(false);
        setSelectedService(null);
        }, 600);
    };

    return (
        <View style={styles.container}>
        
        {/* Cabecera / Logo y Títulos */}
        <View style={styles.header}>
            <View style={styles.topRowLeft}>
            <Image source={require('../assets/logotemple2.png')} style={styles.logo} />
            <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer?.() || console.log('Menú')}>
                <FontAwesome name="bars" size={22} color="#6D512A" />
            </TouchableOpacity>
            </View>
            <Text style={styles.title}>Servicios Realizados</Text>
            <Text style={styles.subtitle}>Registro y seguimiento de cada atención</Text>
        </View>

        {/* Buscador */}
        <View style={styles.searchContainer}>
            <FontAwesome name="search" size={16} color="#B88A3B" style={styles.searchIcon} />
            <TextInput
            style={styles.searchInput}
            placeholder="Buscar por empleado o servicio"
            placeholderTextColor="#9A8478"
            value={searchQuery}
            onChangeText={(text) => handleTextOnlyChange(text, setSearchQuery)}
            />
        </View>

        {/* Botón Registrar Nuevo Servicio */}
        <TouchableOpacity 
            style={styles.registerButton} 
            onPress={handleOpenRegisterConfirm}
        >
            <Text style={styles.registerButtonText}>+ Registrar nuevo servicio</Text>
        </TouchableOpacity>

        {/* Sección Listado */}
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

                {/* Botones de Acción en Tarjeta: Ver, Editar, Eliminar */}
                <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleOpenView(item)}>
                    <FontAwesome name="eye" size={14} color="#B88A3B" style={styles.actionIcon} />
                    <Text style={styles.actionTextVer}>Ver</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={() => handleOpenEdit(item)}>
                    <FontAwesome5 name="pen" size={13} color="#3A75C4" style={styles.actionIcon} />
                    <Text style={styles.actionTextEditar}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={() => handleOpenDelete(item)}>
                    <FontAwesome name="trash" size={14} color="#D32F2F" style={styles.actionIcon} />
                    <Text style={styles.actionTextEliminar}>Eliminar</Text>
                </TouchableOpacity>
                </View>
            </View>
            )}
        />


        {/* ================= MODAL 0: CONFIRMACIÓN DE NUEVO REGISTRO ================= */}
        <Modal
            animationType="fade"
            transparent={true}
            visible={confirmRegisterModalVisible}
            onRequestClose={() => setConfirmRegisterModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalConfirmTitle}>¿Desea agregar un nuevo registro de servicio?</Text>
                <Text style={styles.modalConfirmSubtitle}>A continuación podrá completar los datos de la atención realizada.</Text>

                <View style={styles.modalButtonsRow}>
                <TouchableOpacity 
                    style={styles.modalCancelCustomBtn} 
                    onPress={() => setConfirmRegisterModalVisible(false)}
                >
                    <Text style={styles.modalCancelCustomText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.modalContinueCustomBtn} 
                    onPress={handleProceedToRegisterForm}
                >
                    <Text style={styles.modalContinueCustomText}>Continuar</Text>
                </TouchableOpacity>
                </View>
            </View>
            </View>
        </Modal>


        {/* ================= MODAL 1: FORMULARIO DE REGISTRO ================= */}
        <Modal
            animationType="fade"
            transparent={true}
            visible={registerModalVisible}
            onRequestClose={() => setRegisterModalVisible(false)}
        >
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={styles.modalScrollContainer}>
                <View style={styles.modalContentLarge}>
                <Text style={styles.modalMainTitle}>Registrar Servicio</Text>
                <Text style={styles.modalSubtitle}>Ingrese los datos de la nueva atención</Text>

                {/* Empleado */}
                <Text style={styles.label}>Empleado (Solo letras)</Text>
                <View style={[
                    styles.inputContainerModal, 
                    submitted && (!formEmpleado.trim() ? styles.inputError : styles.inputSuccess)
                ]}>
                    <TextInput 
                    style={styles.input} 
                    placeholder="Ej: Sofía Martínez" 
                    placeholderTextColor="#9A8478" 
                    value={formEmpleado} 
                    onChangeText={(text) => handleTextOnlyChange(text, setFormEmpleado)} 
                    />
                </View>
                {submitted && !formEmpleado.trim() && (
                    <Text style={styles.fieldErrorText}>Ingrese el nombre del empleado.</Text>
                )}

                {/* Tipo de servicio */}
                <Text style={styles.label}>Tipo de servicio (Solo letras)</Text>
                <View style={[
                    styles.inputContainerModal, 
                    submitted && (!formServicio.trim() ? styles.inputError : styles.inputSuccess)
                ]}>
                    <TextInput 
                    style={styles.input} 
                    placeholder="Ej: Radiofrecuencia Facial" 
                    placeholderTextColor="#9A8478" 
                    value={formServicio} 
                    onChangeText={(text) => handleTextOnlyChange(text, setFormServicio)} 
                    />
                </View>
                {submitted && !formServicio.trim() && (
                    <Text style={styles.fieldErrorText}>Ingrese el tipo de servicio.</Text>
                )}

                {/* Monto */}
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
                    />
                </View>
                {submitted && (!formMonto.trim() || !amountRegex.test(formMonto)) && (
                    <Text style={styles.fieldErrorText}>Ingrese un monto válido en números.</Text>
                )}

                {/* Mensaje general de error */}
                {errorMsg ? <Text style={styles.errorTextGeneral}>{errorMsg}</Text> : null}

                {/* Botón Guardar Servicio */}
                <TouchableOpacity style={styles.modalButtonSend} onPress={handleSaveNewService} disabled={loading}>
                    {loading ? <ActivityIndicator color="#FBF7F0" size="small" /> : <Text style={styles.modalButtonSendText}>Guardar Servicio</Text>}
                </TouchableOpacity>

                {/* Botón Cancelar */}
                <TouchableOpacity style={styles.modalButtonSecondary} onPress={() => setRegisterModalVisible(false)} disabled={loading}>
                    <Text style={styles.modalButtonSecondaryText}>Cancelar</Text>
                </TouchableOpacity>
                </View>
            </ScrollView>
            </KeyboardAvoidingView>
        </Modal>


        {/* ================= MODAL 2: VER DETALLE ================= */}
        <Modal
            animationType="fade"
            transparent={true}
            visible={viewModalVisible}
            onRequestClose={() => setViewModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalMainTitle}>Detalle del Servicio</Text>
                
                {selectedService && (
                <View style={styles.viewDetailContainer}>
                    <Text style={styles.label}>Empleado</Text>
                    <View style={styles.viewDisplayBox}><Text style={styles.viewDisplayText}>{selectedService.empleado}</Text></View>

                    <Text style={styles.label}>Tipo de servicio</Text>
                    <View style={styles.viewDisplayBox}><Text style={styles.viewDisplayText}>{selectedService.servicio}</Text></View>

                    <Text style={styles.label}>Monto</Text>
                    <View style={styles.viewDisplayBox}><Text style={styles.viewDisplayText}>{selectedService.monto}</Text></View>

                    <Text style={styles.label}>Fecha y Hora</Text>
                    <View style={styles.viewDisplayBox}><Text style={styles.viewDisplayText}>{selectedService.fecha} - {selectedService.hora}</Text></View>
                </View>
                )}

                <TouchableOpacity style={styles.modalButtonSend} onPress={() => setViewModalVisible(false)}>
                <Text style={styles.modalButtonSendText}>Cerrar</Text>
                </TouchableOpacity>
            </View>
            </View>
        </Modal>


        {/* ================= MODAL 3: EDITAR SERVICIO ================= */}
        <Modal
            animationType="fade"
            transparent={true}
            visible={editModalVisible}
            onRequestClose={() => setEditModalVisible(false)}
        >
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={styles.modalScrollContainer}>
                <View style={styles.modalContentLarge}>
                <Text style={styles.modalMainTitle}>Editar Servicio</Text>
                <Text style={styles.modalSubtitle}>Modifique los datos necesarios</Text>

                {/* Empleado */}
                <Text style={styles.label}>Empleado (Solo letras)</Text>
                <View style={[
                    styles.inputContainerModal, 
                    submitted && (!formEmpleado.trim() ? styles.inputError : styles.inputSuccess)
                ]}>
                    <TextInput 
                    style={styles.input} 
                    value={formEmpleado} 
                    onChangeText={(text) => handleTextOnlyChange(text, setFormEmpleado)} 
                    placeholderTextColor="#9A8478" 
                    />
                </View>
                {submitted && !formEmpleado.trim() && (
                    <Text style={styles.fieldErrorText}>Ingrese el nombre del empleado.</Text>
                )}

                {/* Tipo de servicio */}
                <Text style={styles.label}>Tipo de servicio (Solo letras)</Text>
                <View style={[
                    styles.inputContainerModal, 
                    submitted && (!formServicio.trim() ? styles.inputError : styles.inputSuccess)
                ]}>
                    <TextInput 
                    style={styles.input} 
                    value={formServicio} 
                    onChangeText={(text) => handleTextOnlyChange(text, setFormServicio)} 
                    placeholderTextColor="#9A8478" 
                    />
                </View>
                {submitted && !formServicio.trim() && (
                    <Text style={styles.fieldErrorText}>Ingrese el tipo de servicio.</Text>
                )}

                {/* Monto */}
                <Text style={styles.label}>Monto ($ - Solo números)</Text>
                <View style={[
                    styles.inputContainerModal, 
                    submitted && (!formMonto.trim() || !amountRegex.test(formMonto) ? styles.inputError : styles.inputSuccess)
                ]}>
                    <TextInput 
                    style={styles.input} 
                    value={formMonto} 
                    onChangeText={(text) => setFormMonto(text.replace(/[^0-9]/g, ''))} 
                    keyboardType="numeric" 
                    placeholderTextColor="#9A8478" 
                    />
                </View>
                {submitted && (!formMonto.trim() || !amountRegex.test(formMonto)) && (
                    <Text style={styles.fieldErrorText}>Ingrese un monto válido en números.</Text>
                )}

                {/* Mensaje general de error */}
                {errorMsg ? <Text style={styles.errorTextGeneral}>{errorMsg}</Text> : null}

                {/* Botón Guardar Cambios */}
                <TouchableOpacity style={styles.modalButtonSend} onPress={handleUpdateService} disabled={loading}>
                    {loading ? <ActivityIndicator color="#FBF7F0" size="small" /> : <Text style={styles.modalButtonSendText}>Guardar Cambios</Text>}
                </TouchableOpacity>

                {/* Botón Cancelar */}
                <TouchableOpacity style={styles.modalButtonSecondary} onPress={() => setEditModalVisible(false)} disabled={loading}>
                    <Text style={styles.modalButtonSecondaryText}>Cancelar</Text>
                </TouchableOpacity>
                </View>
            </ScrollView>
            </KeyboardAvoidingView>
        </Modal>


        {/* ================= MODAL 4: ELIMINAR SERVICIO ================= */}
        <Modal
            animationType="fade"
            transparent={true}
            visible={deleteModalVisible}
            onRequestClose={() => setDeleteModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>¿Está seguro que desea eliminar este registro de servicio?</Text>
                <Text style={styles.modalSubtitle}>Esta acción es permanente y no se puede deshacer.</Text>

                {selectedService && (
                <View style={styles.modalPreviewCard}>
                    <Text style={styles.modalPreviewTitle}>{selectedService.empleado}</Text>
                    <Text style={styles.modalPreviewSub}>{selectedService.servicio} • {selectedService.monto}</Text>
                </View>
                )}

                <View style={styles.modalButtonsRow}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setDeleteModalVisible(false)} disabled={loading}>
                    <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalDeleteBtn} onPress={handleDeleteService} disabled={loading}>
                    {loading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.modalDeleteText}>Eliminar</Text>}
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
        paddingHorizontal: 20,
        paddingTop: 35,
        paddingBottom: 25,
    },
    header: {
        alignItems: 'flex-start',
        marginBottom: 16,
        width: '100%',
    },
    topRowLeft: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    logo: {
        width: 130,
        height: 130,
        resizeMode: 'contain',
    },
    menuButton: {
        padding: 8,
    },
    title: {
        fontSize: 22,
        color: '#6D512A',
        fontWeight: 'bold',
        marginBottom: 2,
        alignSelf: 'flex-start',
    },
    subtitle: {
        color: '#7C6860',
        fontSize: 13,
        textAlign: 'left',
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
        marginBottom: 12,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#332211',
    },
    registerButton: {
        backgroundColor: '#C68A36',
        borderRadius: 16,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#6D512A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    registerButtonText: {
        color: '#FBF7F0',
        fontSize: 15,
        fontWeight: 'bold',
    },
    listHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#6D512A',
    },
    counterText: {
        fontSize: 12,
        color: '#7C6860',
        fontWeight: '600',
    },
    listContainer: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#F2E3C8',
        borderRadius: 20,
        padding: 16,
        marginBottom: 14,
        shadowColor: '#6D512A',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    cardEmployee: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#6D512A',
    },
    cardPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#6D512A',
    },
    cardService: {
        fontSize: 13,
        color: '#7C6860',
        marginBottom: 12,
    },
    divider: {
        height: 1,
        backgroundColor: '#E5D3B3',
        marginBottom: 10,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    actionIcon: {
        marginRight: 5,
    },
    actionTextVer: {
        fontSize: 13,
        color: '#B88A3B',
        fontWeight: '600',
    },
    actionTextEditar: {
        fontSize: 13,
        color: '#3A75C4',
        fontWeight: '600',
    },
    actionTextEliminar: {
        fontSize: 13,
        color: '#D32F2F',
        fontWeight: '600',
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
    inputError: {
        borderColor: '#D32F2F',
    },
    inputSuccess: {
        borderColor: '#2E7D32',
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalScrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    modalContent: {
        backgroundColor: '#F2E3C8',
        borderRadius: 24,
        padding: 24,
        width: '90%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    modalContentLarge: {
        backgroundColor: '#F2E3C8',
        borderRadius: 24,
        padding: 24,
        width: '95%',
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
    modalConfirmTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#6D512A',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalConfirmSubtitle: {
        fontSize: 13,
        color: '#7C6860',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalCancelCustomBtn: {
        flex: 1,
        backgroundColor: '#8C7360',
        borderRadius: 14,
        paddingVertical: 12,
        alignItems: 'center',
        marginRight: 8,
    },
    modalCancelCustomText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    modalContinueCustomBtn: {
        flex: 1,
        backgroundColor: '#C68A36',
        borderRadius: 14,
        paddingVertical: 12,
        alignItems: 'center',
        marginLeft: 8,
    },
    modalContinueCustomText: {
        color: '#FBF7F0',
        fontSize: 14,
        fontWeight: 'bold',
    },
    viewDetailContainer: {
        width: '100%',
        marginBottom: 16,
    },
    viewDisplayBox: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#D4B279',
        borderRadius: 12,
        paddingHorizontal: 12,
        justifyContent: 'center',
        minHeight: 42,
    },
    viewDisplayText: {
        fontSize: 14,
        color: '#332211',
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
        fontWeight: 'bold',
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
        fontWeight: 'bold',
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#6D512A',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalPreviewCard: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#D4B279',
        borderRadius: 12,
        padding: 12,
        width: '100%',
        marginBottom: 20,
    },
    modalPreviewTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#6D512A',
    },
    modalPreviewSub: {
        fontSize: 12,
        color: '#7C6860',
        marginTop: 2,
    },
    modalButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalCancelBtn: {
        flex: 1,
        backgroundColor: '#E5D3B3',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        marginRight: 8,
    },
    modalCancelText: {
        color: '#6D512A',
        fontSize: 14,
        fontWeight: 'bold',
    },
    modalDeleteBtn: {
        flex: 1,
        backgroundColor: '#D32F2F',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        marginLeft: 8,
    },
    modalDeleteText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    });