import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../services/AuthContext';
import { Feather } from '@expo/vector-icons';


export default function Login({ navigation }) {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();

    const handleLogin = async () => {

        console.log("1 Botão clicado!");
        if (!email || !password) {
            Alert.alert('Erro', 'Preencha todos os campos');
            return;
        }

        try {
            console.log("2 Chamando função de login do Context...");
            const success = await login(email, password);

            console.log('3 Resultado do login:', success);

            if(!success){
                Alert.alert("Erro de Login", 'E-mail ou senha inválidos!')
            }
        } catch (error) {
            console.error("Erro ao tentar logar:", error);
            console.log("Erro crítico no handleLogin:", error);
            Alert.alert('Erro', 'Ocorreu um erro inesperado.');
        }
    };


    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-blue-50"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                {/* Header Boas Vindas */}
        <View className="px-8 pt-24 pb-12">
                <Text className="text-5xl font-extrabold text-blue-600 tracking-tight">
                    KeePace
                </Text>
                <Text className="text-lg text-blue-400 mt-2 font-medium">Organize seu trabalho e vida, finalmente.</Text>
                </View>

                {/* Formulário de Login */}
                <View className="flex-1 px-8">
                    <Text className="text-2xl font-bold text-gray-800 mb-8">Bem-vindo de volta</Text>

                    {/* Campo Email */}
                    <View className="flex-row items-center border-b border-gray-200 mb-6 pb-2">
                        <Feather name="mail" size={20} color="#9ca3af" />
                        <TextInput 
                         className="flex-1 ml-3 text-base text-gray-800"
                         placeholder='E-mail'
                         placeholderTextColor="#9ca3af"
                         value={email}
                         onChangeText={setEmail}
                         keyboardType='email-address'
                         autoCapitalize='none'
                        />
                    </View>

                    {/* Campo Password */}
                    <View className="flex-row items-center border-b border-gray-200 mb-2 pb-2">
                        <Feather name="lock" size={20} color="#9ca3af" />
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

                    {/* Botão Entrar */}
                    <TouchableOpacity
                        className="bg-blue-600 rounded-2xl p-4 shadow-md shadow-blue-300"
                        onPress={handleLogin}
                    >
                        <Text className="text-white text-center text-lg font-bold uppercase tracking-wider">Entrar</Text>
                    </TouchableOpacity>
                </View>

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
         </ScrollView>
    </KeyboardAvoidingView>
    );
};