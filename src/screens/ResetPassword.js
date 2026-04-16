import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import api from '../services/api';

export default function ResetPassword({ navigation }) {
    const [token, setToken] = useState(''); // Aqui o usuário digita os 6 digitos
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (token.length < 6) {
            Alert.alert("Erro", "O código deve ter 6 dígitos.");
            return;
        }

        try {
            setLoading(true);
            await api.post('/auth/reset-password', { 
                token: token, 
                newPassword: newPassword 
            });

            Alert.alert("Sucesso", "Senha atualizada! Faça login agora.");
            Toast.show({
                type: 'success',
                text1: 'Sucesso!',
                text2: 'Senha atualizada! Faça login agora.',
                visibilityTime: 3000, // Define quanto tempo o tast fica visível
                autoHide: true, // Define se o toast some sozinho
                topOffset: 50, // Define a distância do topo da tela

            });
            navigation.navigate('Login');
        } catch (error) {
            const msg = error.response?.data || 'Erro ao redefinir senha.';
            Alert.alert("Erro", msg);
            Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: 'Código inválido ou expirado.',
                visibilityTime: 3000, // Define quanto tempo o tast fica visível
                autoHide: true, // Define se o toast some sozinho
                topOffset: 50, // Define a distância do topo da tela
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 p-6 bg-white justify-center">
            <Text className="text-2xl font-bold text-gray-800 mb-2">Verificação</Text>
            <Text className="mb-6 text-gray-500">Digite o código enviado ao seu e-mail.</Text>
            
            <TextInput 
                placeholder="Código de 6 dígitos"
                value={token}
                onChangeText={setToken}
                keyboardType='number-pad' // Abre o teclado numérico
                maxLength={6}
                className="bg-gray-100 border border-gray-300 p-4 rounded-2xl mb-4 text-center text-xl font-bold letter-spacing-10"
            />
            <TextInput 
                placeholder="Nova Senha (mín. 6 caracteres)"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                className="bg-gray-100 border border-gray-300 p-4 rounded-xl mb-6"
            />
            <TouchableOpacity 
                onPress={handleReset} 
                disabled={loading}
                className={`p-4 rounded-2xl items-center ${loading ? 'bg-gray-400' : 'bg-green-600'}`}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Redefinir Senha</Text>
                    )}
                <Text className="text-white text-center font-bold">Alterar Senha</Text>
            </TouchableOpacity>
        </View>
    );
}