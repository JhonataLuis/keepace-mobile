import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import api from '../services/api';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';

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
        if (!isFormValid) return;

        try {
            setLoading(true);

            await api.post('', { email });
            Toast.show({ 
                type: 'success',
                text1: 'Sucesso!',
                text2: 'Verifique o seu e-mail para obeter o token.'
            })
            navigation.navigate('ResetPassword', { email }); // Vai para a próxima 

        } catch (error) {
            console.log("Erro: ", error);
            Alert.alert('Erro', 'E-mail não encontrado.')
        } finally {
            setLoading(false);
        }
    }

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