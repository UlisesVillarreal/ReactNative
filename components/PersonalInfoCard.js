import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// Una fila de la tarjeta: etiqueta + valor. Si recibe onEdit, muestra el lápiz para editarla.
function InfoField({ label, icon, value, onEdit, locked, style }) {
    return (
        <View style={[styles.inputGroup, style]}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.valueContainer}>
                <MaterialCommunityIcons name={icon} size={18} color="#B88A3B" style={styles.inputIcon} />
                <Text style={styles.valueText} numberOfLines={1}>{value}</Text>

                {onEdit && (
                    <TouchableOpacity
                        onPress={onEdit}
                        style={styles.editButton}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityRole="button"
                        accessibilityLabel={`Editar ${label}`}
                    >
                        <MaterialCommunityIcons name="pencil-outline" size={18} color="#B88A3B" />
                    </TouchableOpacity>
                )}

                {locked && (
                    <MaterialCommunityIcons name="lock-outline" size={16} color="#B0A090" />
                )}
            </View>
        </View>
    );
}

// onEdit(campo) se llama al tocar el lápiz de un campo ('nombre' | 'apellido' | 'dni' | 'telefono').
// Si no se pasa (por ejemplo mientras carga el perfil), no se muestran los lápices.
export default function PersonalInfoCard({ nombre, apellido, dni, correo, telefono, fechaIngreso, onEdit }) {
    const edit = (campo) => (onEdit ? () => onEdit(campo) : undefined);

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="account-details-outline" size={32} color="#B88A3B" />
                <Text style={styles.cardTittle}>Información Personal</Text>
            </View>

            <InfoField label="Nombre" icon="account-circle-outline" value={nombre} onEdit={edit('nombre')} />
            <InfoField label="Apellido" icon="account-circle-outline" value={apellido} onEdit={edit('apellido')} />
            <InfoField label="DNI" icon="card-account-details-outline" value={dni} onEdit={edit('dni')} />

            {/* El correo es la cuenta de acceso: no se edita desde acá */}
            <InfoField label="Correo" icon="email-outline" value={correo} locked={!!onEdit} />

            <InfoField label="Teléfono" icon="phone-outline" value={telefono} onEdit={edit('telefono')} />

            <InfoField label="Fecha de ingreso" icon="calendar-blank-outline" value={fechaIngreso} locked={!!onEdit} />
        </View>
    );
}

// CARD CSS
const styles = StyleSheet.create({
    card:{
        backgroundColor:'#F2E3C8',
        borderRadius:20,
        padding:20,
        marginTop:20,
        shadowColor:'#6d512a',
        elevation: 5,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: '#E5D3B3',
    },
    cardHeader:{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTittle:{
        fontSize: 18,
        fontFamily: 'PlayfairDisplay_700Bold',
        color: '#6D512A',
        marginLeft: 10,
    },
    inputGroup:{
        marginBottom:12,
    },
    label:{
        fontSize:13,
        color:'#7c6860',
        marginBottom:4,
        fontWeight: '600',
    },
    valueContainer:{
        borderWidth:1.5,
        borderRadius:14,
        paddingHorizontal:12,
        paddingVertical:11,
        borderColor:'#D4B279',
        backgroundColor:'#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 46,
    },
    inputIcon: {
        marginRight: 8,
    },
    valueText:{
        fontSize:14,
        color:'#332211',
        flex: 1,
    },
    editButton: {
        marginLeft: 8,
        padding: 2,
    },
});
