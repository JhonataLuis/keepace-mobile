import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';

import { useAuth } from '../services/AuthContext';


export default function Login({ navigation }) {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Erro', 'Preencha todos os campos');
            return;
        }

        const success = await login(email, password);
        if (success) {
            navigation.replace('Home');
        } else {
            Alert.alert('Erro', 'Email ou senha inválidos');
        }
    };

    return (
        <View className="flex-1 bg-gray-100 justify-center p-6">
            <View className="bg-white rounded-2xl p-6 shadow-lg">
                <Text className="text-3xl font-bold text-center text-blue-600 mb-8">
                    KeePace App
                </Text>
                <TextInput 
                 className="border border-gray-300 rounded-xl p-4 mb-4 text-base"
                 placeholder='Email'
                 value={email}
                 onChangeText={setEmail}
                 keyboardType='email-address'
                 autoCapitalize='none'
                />

                <TextInput 
                 className="border border-gray-300 rounded-xl p-4 mb-6 text-base"
                 placeholder='Senha'
                 value={password}
                 onChangeText={setPassword}
                 secureTextEntry
                />

                <TouchableOpacity
                    className="bg-blue-600 rounded-xl p-4 mb-4"
                    onPress={handleLogin}
                >
                    <Text className="text-white text-center text-lg font-semibold">
                        Entrar
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Registro')}>
                    <Text className="text-center text-blue-600 text-base">
                        Não tem conta? Cadastre-se
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};