import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function PersonalInfoCard({ nombre, dni, correo, telefono, fechaIngreso }) {
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="account-details-outline" size={32} color="#B88A3B" />
                <Text style={styles.cardTittle}>Información Personal</Text>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre completo</Text>
                <View style={styles.valueContainer}>
                    <MaterialCommunityIcons name="account-circle-outline" size={18} color="#B88A3B" style={styles.inputIcon} />
                    <Text style={styles.valueText}>{nombre}</Text> 
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>DNI</Text>
                <View style={styles.valueContainer}>
                    <MaterialCommunityIcons name="card-account-details-outline" size={18} color="#B88A3B" style={styles.inputIcon} />
                    <Text style={styles.valueText}>{dni}</Text>
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Correo</Text>
                <View style={styles.valueContainer}>
                    <MaterialCommunityIcons name="email-outline" size={18} color="#B88A3B" style={styles.inputIcon} />
                    <Text style={styles.valueText}>{correo}</Text>
                </View>
            </View>
            
            <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.label}>Teléfono</Text>
                    <View style={styles.valueContainer}>
                        <MaterialCommunityIcons name="phone-outline" size={18} color="#B88A3B" style={styles.inputIcon} />
                        <Text style={styles.valueText}>{telefono}</Text>
                    </View>
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Fecha de ingreso</Text>
                    <View style={styles.valueContainer}>
                        <MaterialCommunityIcons name="calendar-blank-outline" size={18} color="#B88A3B" style={styles.inputIcon} />
                        <Text style={styles.valueText}>{fechaIngreso}</Text>
                    </View>
                </View>
            </View>

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
    row:{
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});