import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, FlatList, Alert } from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
// Firebase Firestore
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../src/config/firebaseConfig';
// Componentes
import MenuModal from '../components/MenuModal';
import ServiceFormModal from '../components/ServicesModal';

export default function Services({ navigation }) {
    const [services, setServices] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [menuVisible, setMenuVisible] = useState(false);

    // Estados de modales y edición
    const [registerModalVisible, setRegisterModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false); // Estado para el modal de Ver
    const [isEditing, setIsEditing] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

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
        const q = query(collection(db, 'servicios'), orderBy('empleado', 'asc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const lista = [];
            querySnapshot.forEach((documento) => {
                lista.push({ id: documento.id, ...documento.data() });
            });
            setServices(lista);
        }, (error) => {
            console.error("Error al obtener servicios: ", error);
        });

        return () => unsubscribe();
    }, []);

    const filteredServices = services.filter((item) => 
        (item.empleado && item.empleado.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.servicio && item.servicio.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Guardar o Actualizar en Firebase
    const handleSaveService = async () => {
        setSubmitted(true);

        if (!formEmpleado || !formServicio || !formMonto.trim() || !amountRegex.test(formMonto)) {
            setErrorMsg('Por favor, complete los campos faltantes.');
            return;
        }

        setErrorMsg('');
        const formattedAmount = `$${Number(formMonto).toLocaleString('es-AR')}`;
        const { fecha, hora } = getCurrentDateTime();

        setLoading(true);
        try {
            if (isEditing && selectedService) {
                const docRef = doc(db, 'servicios', selectedService.id);
                await updateDoc(docRef, {
                    empleado: formEmpleado,
                    servicio: formServicio,
                    monto: formattedAmount,
                    fecha: fecha,
                    hora: hora
                });
            } else {
                await addDoc(collection(db, 'servicios'), {
                    empleado: formEmpleado,
                    servicio: formServicio,
                    monto: formattedAmount,
                    fecha: fecha,
                    hora: hora
                });
            }
            setRegisterModalVisible(false);
        } catch (error) {
            console.error("Error al guardar en Firebase:", error);
            setErrorMsg("No se pudo conectar con la base de datos.");
        } finally {
            setLoading(false); 
        }
    };

    const handleOpenCreate = () => {
        setIsEditing(false);
        setFormEmpleado('');
        setFormServicio('');
        setFormMonto('');
        setSubmitted(false);
        setErrorMsg('');
        setRegisterModalVisible(true);
    };

    const handleOpenEdit = (item) => {
        setSelectedService(item);
        setIsEditing(true);
        setFormEmpleado(item.empleado);
        setFormServicio(item.servicio);
        setFormMonto(item.monto.replace(/\D/g, ''));
        setSubmitted(false);
        setErrorMsg('');
        setRegisterModalVisible(true);
    };

    // Función para abrir el modal de Ver detalle
    const handleOpenView = (item) => {
        setSelectedService(item);
        setViewModalVisible(true);
    };

    const handleDeleteService = async (id) => {
        Alert.alert(
            "Eliminar servicio",
            "¿Está seguro que desea eliminar este registro?",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Eliminar", 
                    style: "destructive", 
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'servicios', id));
                        } catch (error) {
                            console.error("Error al eliminar:", error);
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.topRowLeft}>
                    <Image source={require('../assets/logotemple2.png')} style={styles.logo} />
                    <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
                        <MaterialCommunityIcons name="menu-open" size={36} color="#6D512A" />
                    </TouchableOpacity>
                </View>
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

            {/* Modal de Crear / Editar y de Ver Detalle unificados */}
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
                // Props para el modal de Ver
                viewMode={viewModalVisible}
                selectedService={selectedService}
                onCloseView={() => setViewModalVisible(false)}
            />

            <MenuModal
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                onLogout={() => navigation.replace('Login')}
                navigation={navigation} 
            />
        </View>
    );
}

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#FBEBD7', 
    paddingHorizontal: 20, 
    paddingTop: 35, 
    paddingBottom: 25 
},
header: { 
    alignItems: 'flex-start', 
    marginBottom: 16, 
    width: '100%' 
},
topRowLeft: { 
    flexDirection: 'row', 
    width: '100%', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 4 
},
logo: { 
    width: 130, 
    height: 130, 
    resizeMode: 'contain'
},
menuButton: { 
    padding: 8 
},
title: { 
    fontSize: 22,
    color: '#6D512A', 
    fontWeight: 'bold', 
    marginBottom: 2
},
subtitle: { 
    color: '#7C6860',
    fontSize: 13 
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
});