import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message'; // Para mensagens de alert mais estilizadas
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Register({ navigation }) {

    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const clearToken = async () => {
            await AsyncStorage.removeItem('@KeePace:token');
        };
        clearToken();
    }, []);

    // Valida se é um formato de email o digitado
    const validateEmail = (email) => {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    };

    // Regex para usuário digitar senha em um padrão com mais segurança
    const validatePassword = (password) => {
        // Pelo menos 8 caracteres, 1 letra, 1 número e 1 caractere especial
        const re = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&.]).{8,}$/;
        return re.test(password);
    };

    const handleRegister = async () => {

        try {
            console.log("Iniciando chamada API...!"); // teste botão click
            // Validações básicas
            if (!userName || !email || !password) {
            Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: 'Por favor, preencha todos os campos.',
                visibilityTime: 3000, // Define quanto tempo o tast fica visível
                autoHide: true, // Define se o toast some sozinho
                topOffset: 50, // Define a distância do topo da tela
            });
                return;
            }

            // Validação de formato de email
            if (!validateEmail(email)) {
                Toast.show({
                    type: 'error',
                    text1: 'E-mail inválido',
                    text2: 'Por favor, insira um e-mail com formato válido',
                    visibilityTime: 3000, // Define quanto tempo o tast fica visível
                    autoHide: true, // Define se o toast some sozinho
                    topOffset: 50, // Define a distância do topo da tela
                });
                return;
            }

            // Força da senha com segurança
            if (!validatePassword(password)) {
                Toast.show({
                    type: 'error',
                    text1: 'Senha Fraca',
                    text2: 'A senha deve ter no mínimo 8 caracteres, incluindo letras, números e caracter especial.',
                    visibilityTime: 4000, // Define quanto tempo o tast fica visível
                    autoHide: true, // Define se o toast some sozinho
                    topOffset: 50, // Define a distância do topo da tela
                });
                return;
            }

            if (password !== confirmPassword) {
                Toast.show({
                    type: 'error',
                    text1: 'Erro',
                    text2: 'As senhas não coincidem.',
                    position: 'top',
                    visibilityTime: 3000, // Define quanto tempo o tast fica visível
                    autoHide: true, // Define se o toast some sozinho
                    topOffset: 50, // Define a distância do topo da tela
                });
                return;
            }

        
                setLoading(true);
                console.log('Tentando cadastrar usuário...');

                const response = await api.post('/auth/register', {
                    name: userName,
                    email: email,
                    password: password
                }, {
                    headers: { Authorization: ''} // Remove o token apenas nesta chamada
                });

                // Mensagem estilizada para o usuário após o sucesso do cadastro
                Toast.show({
                    type: 'success',
                    text1: 'Sucesso!',
                    text2: 'Sua conta foi criada com sucesso.',
                    visibilityTime: 3000, // Define quanto tempo o tast fica visível
                    autoHide: true, // Define se o toast some sozinho
                    topOffset: 50, // Define a distância do topo da tela
                    onHide: () => navigation.navigate('Login')
                });

            } catch (error) {
                console.log("--- ERRO DETALHADO ---");
                
                // 1. Extrai a mensagem vinda do Backend (Email already exists)
                // Usamos o encadeamento opcional (?.) para evitar erros caso o objeto não exista
                const mensagemErro = error.response?.data?.message || "Não foi possível realizar o cadastro.";

                // 2. Exibe o Toast de erro com a mensagem específica
                Toast.show({
                    type: 'error',
                    text1: 'Erro no cadastro',
                    text2: mensagemErro, // Aqui aparecerá "Email already exists"
                    visibilityTime: 5000,
                    autoHide: true,
                    topOffset: 50,
                });

                // Logs para depuração no terminal
                if (error.response) {
                    console.log("Status do Servidor:", error.response.status);
                    console.log("Mensagem do Servidor:", error.response.data.message);
                } else if (error.request) {
                    console.log("O servidor não respondeu. Verifique a conexão.");
                } else {
                    console.log("Erro inesperado:", error.message);
                }

            } finally {
                setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
            {/* Header / Voltar  */}
            <View className="px-6 pt-4">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                >
                    <Feather name="arrow-left" size={24} color="#374151" />
                </TouchableOpacity>
            </View>

            <View className="px-8 pt-8">
                <Text className="text-3xl font-bold items-center text-gray-800">Create an Account</Text>
                <Text className="text-gray-500 mt-2">
                    Comece a organizar suas tarefas hoje mesmo no KeePace.
                </Text>
            </View>

            {/* Formulário */}
            <View className="px-8 mt-10 space-y-4">

                {/* Input Nome */}
                <View>
                    <Text className="text-gray-700 font-semibold mb-2 ml-1">Nome Completo</Text>
                    <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                        <Feather name='user' size={20} color="#9ca3af" />
                        <TextInput 
                            className="flex-1 ml-3 text-gray-700"
                            placeholder='Seu nome'
                            value={userName}
                            onChangeText={setUserName}
                        />
                    </View>
                </View>

                {/* Input Email */}
                <View>
                    <Text className="text-gray-700 font-semibold mb-2 ml-1">E-mail</Text>
                    <View 
                        className={`flex-row items-center bg-gray-50 border rounded-2xl px-4 py-3 ${
                            email.length > 0 && !validateEmail(email) ? 'border-red-500' : 'border-gray-200'
                        }`}>
                        <Feather name='mail' size={20}  color={email.length > 0 && !validateEmail(email) ? "#ef4444" : "#9ca3af"} />
                        <TextInput 
                            className="flex-1 ml-3 text-gray-700"
                            placeholder='Email Address'
                            keyboardType='email-address'
                            autoCapitalize='none'
                            autoCorrect={false} // Evita que o corretor mude o e-mail
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>
                    {email.length > 0 && !validateEmail(email) && (
                        <Text className="text-red-500 text-xs mt-1 ml-1">Formato de e-mail inválido!</Text>
                    )}
                </View>

                {/* Iput Senha */}
                <View>
                    <Text className="text-gray-700 font-semibold mb-2 ml-1">Senha</Text>
                    <View className={`flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 ${
                        password.length > 0 && !validatePassword(password) ? 'border-orange-400' : 'border-gray-200'
                    }`}>
                        <Feather name="lock" size={20} color="#9ca3af" />
                        <TextInput 
                            className="flex-1 ml-3 text-gray-700"
                            placeholder='Password'
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                        />

                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>

                    {/* Legenda de ajuda */}
                    <Text className={`text-[10px] mt-1 ml-1 ${
                        password.length > 0 && !validatePassword(password) ? 'text-orange-500' : 'text-gray-400'
                    }`}>Mínimo 8 caracteres, com letras, números e 1 caracter especial.</Text>
                </View>

                {/* Confirmar Senha */}
                <View>
                    <Text className="text-gray-700 font-semibold mb-2 ml-1">Confirmar Senha</Text>
                    <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                        <Feather name='check-circle' size={20} color="#9ca3af" />
                        <TextInput 
                            className="flex-1 ml-3 text-gray-700"
                            placeholder='Confirm Password'
                            secureTextEntry={!showPassword}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                    </View>
                </View>
            </View>

            {/* Botão Registrar */}
            <View className="px-8 mt-10">
                <TouchableOpacity
                    onPress={handleRegister}
                    disabled={loading}
                    className={`bg-blue-600 p-4 rounded-2xl items-center shadow-lg shadow-blue-300 ${loading ? 'opacity-70' : ''}`}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (

                        <Text className="text-white font-bold text-lg">Create an Account</Text>
                    )}

                </TouchableOpacity>
            </View>

                {/* Footer: Já tem conta  */}
                <View className="flex-row justify-center mt-auto mb-10 pt-6">
                    <Text className="text-gray-500">Já possui uma conta?</Text>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                    >
                        <Text className="text-blue-600 font-bold"> Fazer Login</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};