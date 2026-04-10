import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message'; // Para mensagens de alert mais estilizadas
import api from '../services/api';

export default function Register({ navigation }) {

    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Valida se é um formato de email o digitado
    const validateEmail = (email) => {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    };

    // Regex para usuário digitar senha em um padrão com mais segurança
    const validatePassword = (password) => {
        // Pelo menos 8 caracteres, uma letra, um número e um caractere especial
        const re = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
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
                    position: 'top',
                    visibilityTime: 3000
            });
                return;
            }

            // Validação de formato de email
            if (!validateEmail(email)) {
                Toast.show({
                    type: 'error',
                    text1: 'E-mail inválido',
                    text2: 'Por favor, insira um e-mail com formato válido',
                });
                return;
            }

            // Força da senha com segurança
            if (!validatePassword(password)) {
                Toast.show({
                    type: 'error',
                    text1: 'Senha Fraca',
                    text2: 'A senha deve ter no mínimo 8 caracteres, incluindo letras, números e caracter especial.',
                    visibilityTime: 4000
                });
                return;
            }

            if (password !== confirmPassword) {
                Toast.show({
                    type: 'error',
                    text1: 'Erro',
                    text2: 'As senhas não coincidem.',
                    position: 'top',
                    visibilityTime: 3000
                });
                return;
            }

        
                setLoading(true);
                console.log('Tentando cadastrar usuário...');

                const response = await api.post('/auth/register', {
                    name: userName,
                    email: email,
                    password: password
                });

                // Mensagem estilizada para o usuário após o sucesso do cadastro
                Toast.show({
                    type: 'success',
                    text1: 'Sucesso!',
                    text2: 'Sua conta foi criada com sucesso.',
                    position: 'top',
                    visibilityTime: 3000,
                    onHide: () => navigation.navigate('Login')
                });

            //console.log("usuário new: ", response.data.content);
        } catch (error) {
            console.log(error);
            const mensagem = error.response?.data?.message || "Não foi possível realizar o cadastro.";
            Alert.alert("Erro no cadastro", mensagem);
            console.log("--- ERRO DETALHADO ---");
            if (error.response) {
                // O servidor respondeu com um status fora de 2xx
                console.log("Dados:", error.response.data);
                console.log("Status:", error.response.status);
            } else if (error.request) {
                // A requisição foi feita mas não houve resposta (Erro de Rede/IP)
                console.log("A requisição foi feita, mas o servidor não respondeu. Verifique o IP e o Firewall.");
            } else {
                console.log("Erro ao configurar requisição:", error.message);
            }
            Alert.alert("Erro", "Verifique sua conexão com o servidor.");
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
                <Text className="text-3xl font-bold text-gray-800">Criar Conta</Text>
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
                            placeholder='seu@email.com'
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
                            placeholder='••••••••'
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
                            placeholder='••••••••'
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

                        <Text className="text-white font-bold text-lg">Cadastrar</Text>
                    )}

                </TouchableOpacity>
            </View>

            {/* Footer: Já tem conta  */}
            <View className="flex-row justify-center mt-auto mb-10 pt-6">
                <Text className="text-gray-500">Já possui uma conta?</Text>
                <TouchableOpacity>
                    <Text className="text-blue-600 font-bold">Fazer Login</Text>
                </TouchableOpacity>
            </View>
            </ScrollView>
        </SafeAreaView>
    );
};