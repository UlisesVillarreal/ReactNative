import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function MenuModal({ visible, onClose, onLogout, navigation }) {

    const MenuItem = ({ title, icon, active, onPress }) => (
        <TouchableOpacity
            style={[styles.menuItem, !active && styles.menuItemDisabled]}
            onPress={onPress}
            disabled={!active}  
        >
            <MaterialCommunityIcons 
                name={icon} 
                size={22}
                color={active ? "#6D512A" : "#B0B0B0"}/>
            <Text style={[styles.menuText, !active && styles.menuTextDisabled]}>
                {title}
            </Text>
        </TouchableOpacity>
    );

    return(
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}>

            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                {/* Contenedor lateral tipo Sidebar */}
                <TouchableOpacity activeOpacity={1} style={styles.menuContainer}>
                    <ScrollView showsVerticalScrollIndicator={false}>

                        <Text style={styles.menuTitle}>Menú Principal</Text>

                        {/* Sección de NAVEGACIÓN */}
                        <MenuItem title="Inicio" icon="home-outline" active={true} 
                            onPress={() => {
                                onClose();
                                navigation.navigate('Home');
                            }}
                        />
                        <MenuItem title="Empleados" icon="account-group-outline" active={false} />
                        <MenuItem title="Asistencias" icon="calendar-check-outline" active={false} />
                        
                        {/* 🛠️ Aquí apunta exactamente al archivo Services.js */}
                        <MenuItem title="Servicios realizados" icon="spa-outline" active={true}
                            onPress={()=> {
                                onClose();
                                navigation.navigate('Services');
                            }}
                        />
                        <MenuItem title="Reportes" icon="chart-box-outline" active={false} />

                        <View style={styles.divider} />

                        {/* Sección De PERFIL / CONFIGURACIÓN / SESIÓN */}
                        <MenuItem title="Editar perfil" icon="account-edit-outline" active={false} />
                        <MenuItem title="Configuraciones" icon="cog-outline" active={false} />
                        <MenuItem title="Cerrar sesión" icon="logout" active={true} 
                            onPress={() => {
                                onClose(); 
                                onLogout();
                            }} 
                        />
                    </ScrollView>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    menuContainer: {
        width: '75%',
        height: '100%',
        backgroundColor: '#F2E3C8',
        paddingTop: 60,
        paddingHorizontal: 20,
        shadowColor: '#000',
        elevation: 10,
    },
    menuTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#6D512A',
        marginBottom: 20,
        paddingLeft: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 10,
        borderRadius: 12,
        marginBottom: 4,
    },
    menuItemDisabled: {
        opacity: 0.6,
    },
    menuText: {
        fontSize: 15,
        color: '#333',
        marginLeft: 15,
        fontWeight: '600',
    },
    menuTextDisabled: {
        color: '#B0B0B0',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5D3B3',
        marginVertical: 15,
    }
});