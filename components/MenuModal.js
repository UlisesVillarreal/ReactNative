import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
                size={24}
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
                    <TouchableOpacity activeOpacity={1} style={styles.menuContainer}>

                        <Text style={styles.menuTitle}>Menú Principal</Text>

                        {/* Seccion de NAVEGACIÓN */}
                        <MenuItem title="Inicio" icon="home-outline" active={false} />
                        <MenuItem title="Empleados" icon="account-group-outline" active={false} />
                        <MenuItem title="Asistencia" icon="calendar-check-outline" active={false} />

                        {/* Primera sección habilitada */}
                        <MenuItem title="Servicios" icon="spa-outline" active={true}
                            onPress={()=> {
                            onClose();
                            navigation.navigate('Services');
                            }}
                        />
                        <MenuItem title="Reportes" icon="chart-box-outline" active={false} />

                        <View style={styles.divider} />

                        {/* Seccion De PERFIL/CONFIGURACIÓN/SESIÓN */}
                        <MenuItem title="Editar perfil" icon="account-edit-outline" active={false} />
                        <MenuItem title="Configuraciones" icon="cog-outline" active={false} />

                        {/* Boton de cerrar Sesión */}
                        <MenuItem title="Cerrar sesión" icon="logout" active={true} 
                            onPress={() => {
                            onClose(); 
                            onLogout();
                            }} 
                        />
                    </TouchableOpacity>
                </TouchableOpacity>
            
            </Modal>

    );
}


const styles=StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuContainer: {
        width: '80%',
        backgroundColor: '#FBF1F0',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        elevation: 10,
    },
    menuTitle: {
        fontSize: 22,
        fontFamily: 'PlayfairDisplay_700Bold',
        color: '#6D512A',
        marginBottom: 20,
        textAlign: 'center',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 10,
    },
    menuItemDisabled: {
        opacity: 0.7,
    },
    menuText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 15,
        fontWeight: '500',
    },
    menuTextDisabled: {
    color: '#B0B0B0', // Texto gris para los deshabilitados
    },
    divider: {
    height: 1,
    backgroundColor: '#EAEAEA',
    marginVertical: 15,
    }
}); 