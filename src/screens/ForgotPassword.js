import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import api from '../services/api';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';
import { Keyboard } from 'react-native';

export default function ForgotPassword({ navigation }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    // Validação de email
    const isEmailValid = (email) => {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    };

    const isFormValid = isEmailValid(email);

    const handleSendEmail = async () => {
        console.log("Iniciando forgot-password...");
        if (!isFormValid) return;

        Keyboard.dismiss(); // Para fechar o teclado ao clicar no botão 'enviar'

        try {
            setLoading(true);

            await api.post('/auth/forgot-password', { email });
            Toast.show({ 
                type: 'success',
                text1: 'Sucesso!',
                text2: 'Verifique o seu e-mail para obeter o token.',
                visibilityTime: 3000, // Define quanto tempo o tast fica visível
                autoHide: true, // Define se o toast some sozinho
                topOffset: 50, // Define a distância do topo da tela
            })
            console.log("NAVEGANDO: ", navigation.getState());
            navigation.navigate('ResetPassword', { email }); // Vai para a próxima 

        } catch (error) {
            console.log("Erro: ", error);
            Toast.show({

                type: 'error',
                text1: 'Erro',
                text2: 'Email não encontrdo',
                visibilityTime: 3000, // Define quanto tempo o tast fica visível
                autoHide: true, // Define se o toast some sozinho
                topOffset: 50, // Define a distância do topo da tela
            });

            if (error.response) {
                // O servidor respondeu com um status fora do range 2xx
                console.log("Dados do Erro:", error.response.data);
                console.log("Status do Erro:", error.response.status);
            } else if (error.request) {
                // A requisição foi feita mas não houve resposta (Problema de IP/Rede)
                console.log("Erro na Requisição (Sem resposta):", error.request);
                Alert.alert("Erro de Conexão", "Não foi possível alcançar o servidor. Verifique o IP da API.");
            } else {
                console.log("Erro Geral:", error.message);
            }
            
            Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: 'Não foi possível processar a solicitação.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className= "flex-1 bg-white"
            >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                <View className="px-8 pt-20 pb-10">
                    <Text className="text-5xl font-extrabold text-blue-600 tracking-tight">
                        KeePace
                    </Text>
                    <Text className="text-lg text-gray-400 mt-2 font-medium">
                        Recuperação de acesso
                    </Text>
                </View>
                {/* Conteúdo */}
                <View className="flex-1 px-8">
                        <Text className="text-2xl font-bold text-gray-800 mb-2">Esqueceu sua senha?</Text>
                        <Text className="text-gray-500 mb-8">
                            Informe seu e-mail para receber as instruções de redefinição.
                        </Text>

                    {/* Campo Email */}
                    <View className={`flex-row items-center border-b mb-8 pb-2 ${
                        email.length > 0 ? (isEmailValid(email) ? 'border-blue-500' : 'border-red-500')
                        : 'border-gray-200'
                    }`}>

                        <Feather name='mail' size={20} color={email.length > 0
                                ? (isEmailValid(email) ? '#3b82f6' : '#ef4444')
                                : '#9ca3af'
                            } 
                        />

                        <TextInput 
                            className="flex-1 ml-3 text-base text-gray-800"
                            placeholder='E-mail Address'
                            placeholderTextColor="#9ca3af"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType='email-address'
                            autoCapitalize='none'                    
                            
                        />

                        {email.length > 0 && (
                            <Feather 
                                name={isEmailValid(email) ? 'check-circle' : 'x-circle'}
                                size={16}
                                color={isEmailValid(email) ? '#10b981' : '#ef4444'}
                            />
                        )}
                    </View>
                    {/* Botão */}
                    <TouchableOpacity
                        className={`rounded-2xl p-4 shadow-md ${
                            isFormValid ? 'bg-blue-600 shadow-blue-300' : 'bg-gray-300'
                        }`}
                        onPress={handleSendEmail}
                        disabled={!isFormValid || loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                                <Text className={`text-center text-lg font-bold uppercase tracking-wider ${
                                    isFormValid ? 'text-white' : 'text-gray-500'
                                }`}>
                                    Enviar
                                </Text>
                        )}

                    </TouchableOpacity>

                    {/* Vaoltar */}
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="mt-6 items-center"
                    >
                        <Text className="text-blue-600 font-semibold">Voltar para login</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};