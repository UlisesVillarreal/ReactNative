import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function PersonalInfoCard({ nombre, dni, correo, telefono, fechaIngreso }) {
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="account-outline" size={45} color="#B88A3B" />
                <Text style={styles.cardTittle}>Información Personal</Text>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre completo</Text>
                <View style={styles.valueContainer}>
                    <Text style={styles.valueText}>{nombre}</Text> 
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>DNI</Text>
                <View style={styles.valueContainer}>
                    <Text style={styles.valueText}>{dni}</Text>
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Correo</Text>
                <View style={styles.valueContainer}>
                    <Text style={styles.valueText}>{correo}</Text>
                </View>
            </View>
            
            <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.label}>Teléfono</Text>
                    <View style={styles.valueContainer}>
                        <Text style={styles.valueText}>{telefono}</Text>
                    </View>
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Fecha de ingreso</Text>
                    <View style={styles.valueContainer}>
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
        backgroundColor:'#FBF1F0',
        borderRadius:15,
        padding:20,
        marginTop:20,
        shadowColor:'#6d512a',
        elevation: 5,
    },
    cardHeader:{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardTittle:{
        fontSize: 20,
        fontFamily: 'PlayfairDisplay_400Regular', 
        color: '#6D512A',
        marginLeft: 10,
    },
    inputGroup:{
        marginBottom:15,
    },
    label:{
        fontSize:15,
        color:'#7c6860',
        marginBottom:5,
    },
    valueContainer:{
        borderWidth:1,
        borderRadius:8,
        padding:12,
        borderColor:'#b88a3b',
        backgroundColor:'#',
    },
    valueText:{
        fontSize:15,
        color:'#6d512a',
    },
    row:{
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});