import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../services/AuthContext';
import { Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';


export default function Login({ navigation }) {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    // Validação de E-mail em tempo real
    const isEmailValid = (email) => {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    };

    // Verifica se o formulário está pronto para envio
    const isFormValid = isEmailValid(email) && password.length >= 8;

    const handleLogin = async () => {
        if(!isFormValid) return;

        try {
            console.log("1 Botão clicado!");
            if (!email || !password) {
                Toast.show({
                    type: 'error',
                    text1: 'Erro',
                    text2: 'Preencha todos os campos!',
                    visibilityTime: 3000
                });
                return;
            }

        
            setLoading(true);
            console.log("2 Chamando função de login do Context...");
            const success = await login(email, password);

            console.log('3 Resultado do login:', success);

            if(!success){
                Toast.show({
                    type: 'error',
                    text1: 'Erro de Autenticação',
                    text2: 'E-mail ou senha inválidos!',
                    visibilityTime: 3000
                });
            }
        } catch (error) {
            // Tratamento de erro 403
            if (error.response) {
                const status = error.response.status;

                if (status === 403) {
                    Toast.show({
                        type: 'error',
                        text1: 'Falha no Login',
                        text2: 'Credenciais inválidas ou conta bloqueada.',
                    });
                } else if (status === 404) {
                    Toast.show({
                        type: 'error',
                        text1: 'Servidor',
                        text2: 'Serviço de autenticação não encontrada.',
                    });
                } else {
                    Toast.show({
                        type: 'error',
                        text1: 'Erro' + status,
                        text2: 'Ocorreu um problema no servidor.',
                    });
                }
            } else if (error.request) {
                Toast.show({
                    type: 'error',
                    text1: 'Erro de conexão',
                    text2: 'Não foi possível conectar ao servidor.',

                });
            }
            console.error("Erro ao tentar logar:", error);
            console.log("Erro crítico no handleLogin:", error);
            Alert.alert('Erro', 'Ocorreu um erro inesperado ao tentar logar.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                {/* Header Boas Vindas */}
                <View className="px-8 pt-20 pb-10">
                    <Text className="text-5xl font-extrabold text-blue-600 tracking-tight">
                        KeePace
                    </Text>
                    <Text className="text-lg text-gray-400 mt-2 font-medium">Organize seu trabalho e vida, finalmente.</Text>
                </View>

                {/* Formulário de Login */}
                <View className="flex-1 px-8">
                    <Text className="text-2xl font-bold text-gray-800 mb-8">Bem-vindo de volta</Text>

                    {/* Campo Email com validação Visual */}
                    <View className={`flex-row items-center border-b mb-6 pb-2 ${
                        email.length > 0 ? (isEmailValid(email) ? 'border-blue-500' : 'border-red-500') : 'border-gray-200'
                    }`}
                    >
                        <Feather name="mail" size={20} color={email.length > 0 ? (isEmailValid(email) ? '#3b82f6' : '#ef4444') : '#9ca3af'} />
                        <TextInput 
                            className="flex-1 ml-3 text-base text-gray-800"
                            placeholder='E-mail'
                            placeholderTextColor="#9ca3af"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType='email-address'
                            autoCapitalize='none'
                        />
                        {email.length > 0 && (
                            <Feather
                                name={isEmailValid(email) ? "check-circle" : "x-circle"}
                                size={16}
                                color={isEmailValid(email) ? "#10b981" : "#ef4444"}    
                            />
                        )}
                    </View>

                    {/* Campo Password */}
                    <View className={`flex-row items-center border-b mb-2 pb-2 ${
                        password.length > 0 ? (password.length >= 8 ? 'border-blue-500' : 'border-orange-400') : 'border-gray-200'
                    }`}>
                        <Feather name="lock" size={20} color={password.length >= 8 ? '#3b82f6' : '#9ca3af'} />
                        <TextInput 
                            className="flex-1 ml-3 text-base text-gray-800"
                            placeholder='Password'
                            placeholderTextColor="#9ca3af"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity className="items-end mb-8">
                        <Text className="text-blue-600 font-semibold text-sm">Esqueceu a senha?</Text>
                    </TouchableOpacity>

                    {/* Botão Entrar Dinâmico */}
                    <TouchableOpacity
                        className={`rounded-2xl p-4 shadow-md ${
                            isFormValid ? 'bg-blue-600 shadow-blue-300' : 'bg-gray-300'
                        }`}
                        onPress={handleLogin}
                        disabled={!isFormValid || loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className={`text-center text-lg font-bold uppercase tracking-wider ${
                                isFormValid ? 'text-white' : 'text-gray-500'
                            }`}>
                                Entrar
                            </Text>
                        )}
                    </TouchableOpacity>
               
                {/* Divisor Login Social */}
                <View className="flex-row items-center my-10">
                    <View className="flex-1 h-[1px] bg-gray-200" />
                        <Text className="px-4 text-gray-400">ou continue com</Text>
                     <View className="flex-1 h-[1px] bg-gray-200" />
                </View>

                {/* Botões Sociais  */}
                <View className="flex-row justify-between mb-8">
                    <TouchableOpacity className="flex-1 flex-row items-center justify-center border border-gray-200 rounded-xl p-3 mr-2">
                        <Feather name="chrome" size={20} color="#DB4437" />
                        <Text className="ml-2 font-medium">Google</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 flex-row items-center justify-center border border-gray-200 rounded-xl p-3 mr-2">
                        <Feather name="smartphone" size={20} color="#000" />
                        <Text className="ml-2 font-medium">Apple</Text>
                    </TouchableOpacity>
                </View>

                {/* Link Criar conta */}
                <View className="flex-row justify-center mb-10">
                    <Text className="text-gray-500">Novo por aqui? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text className="text-blue-600 font-bold">Crie sua conta</Text>
                    </TouchableOpacity>
                </View>
                 </View>
         </ScrollView>
    </KeyboardAvoidingView>
    );
};