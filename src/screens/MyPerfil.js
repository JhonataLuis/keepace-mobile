import React, { useState } from 'react';
import { Image, View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../services/AuthContext';
import Toast from 'react-native-toast-message';

export default function Perfil({ navigation }) {
    const { user, logout } = useAuth();

    const BASE_URL = "http://192.168.5.115:8080";

    // Função profissional para avisar sobre funções em desenvolvimento
    const handleCommingSoon = (feature) => {
        Toast.show({
            typeof: 'info',
            text1: 'Em desenvolvimento',
            text2: `${feature} estará disponível em breve no KeePace!`,
            visibilityTime: 3000,
        });
    };

    console.log("Perfil:", user);
    console.log("Nome USER:", user?.name);

    const MenuOption = ({ icon, title, subtitle, onPress, color = "text-gray-700", isLast = false, isComingSoon = false }) => (
        <TouchableOpacity
          onPress={isComingSoon ? () => handleCommingSoon(title) : onPress}
          activeOpacity={0.7}
          className={`flex-row items-center py-4 ${!isLast ? 'border-b border-gray-100' : ''} ${isComingSoon ? 'opacity-60' : ''}`}
        >
            <View className={`p-2 rounded-lg ${isComingSoon ? 'bg-gray-100' : 'bg-blue-100'}`}>
                <Feather name={icon} size={20} color={isComingSoon ? "#9ca3af" : "#3b82f6"}/>
            </View>
            <View className="flex-1 ml-4">
                <View className="flex-row items-center">
                    <Text className={`text-base font-semibold ${isComingSoon ? 'text-gray-400' : color}`}>{title}</Text>
                    {isComingSoon && (
                        <View className="bg-amber-100 px-2 py-0.5 rounded-full ml-2 border border-amber-200">
                            <Text className="text-[8px] font-bold text-amber-600 uppercase">Em breve</Text>
                        </View>
                    )}
                </View>
                    {subtitle && <Text className="text-xs text-gray-400">{subtitle}</Text>}
            </View>
            {!isComingSoon && <Feather name='chevron-right' size={16} color="#d1d5db" />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-blue-50">
            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="items-center pt-8 pb-10 px-6">
                    <View className="relative">
                        <View className="w-24 h-24 bg-blue-600 rounded-full items-center justify-center shadow-xl shadow-blue-300 overflow-hidden border-2 border-white">
                            {user?.profilePhoto ? (
                                <Image
                                 source={{ uri: `${BASE_URL}${user.profilePhoto}?t=${new Date().getTime()}` }}
                                 className="w-full h-full rounded-full"
                                 resizeMode='cover'
                                />
                            ) : (

                                <Text className="text-white text-3xl font-bold">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </Text>
                            )}

                        </View>
                        <TouchableOpacity 
                            className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-gray-50"
                            onPress={() => handleCommingSoon('Troca de foto')}
                            >
                            <Feather name='camera' size={16} color="#3b82f6" />
                        </TouchableOpacity>
                    </View>
                    <Text className="text-2xl font-bold text-gray-800 mt-4">{user?.name || 'Usuário'}</Text>
                    <Text className="text-gray-500">{user?.email || 'email@exemplo.com'}</Text>
                </View>
            

            {/* Seção: Conta */}
            <View className="px-6 mb-6">
                <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Minha Conta</Text>
            
                    <View>
                        <MenuOption 
                            icon="user"
                            title="Dados Pessoais"
                            subtitle="Editar nome e informações"
                            isComingSoon={true} // Nova prop
                            onPress={() => handleFeatureNotAvailable('Dados Pessoais')}
                        />

                        <MenuOption 
                            icon="lock"
                            title="Segurança"
                            subtitle="Alterar senha e privacidade"
                            onPress={() => navigation.navigate('AlterarSenha')}
                        />

                        <MenuOption 
                            icon="bell"
                            title="Notificações"
                            subtitle="Configurar lembretes de tarefas"
                            isLast={true}
                            isComingSoon={true}
                        />
                    </View>
                </View>

                {/* Seção: App & Preferências  */}
                <View className="px-5 mb-6">
                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Preferências</Text>
                    <View className="bg-white rounded-3xl px-4 shadow-sm border border-blue-100">
                        {/* Modo Escuro (Visual Desabilitado) */}
                        <View className="flex-row items-center py-4 border-b border-gray-100 opacity-50">
                            <View className="bg-blue-100 p-2 rounded-lg">
                                <Feather name='moon' size={20} color="#3b82f6" />
                            </View>
                            <View className="flex-1 ml-4">
                                <Text className="text-base font-semibold text-gray-700">Modo Escuro</Text>
                            </View>
                            <Switch 
                                disabled={true}
                                trackColor={{ false: "#d1d5db", true: "#bfdbfe" }}
                                thumbColor="#f4f3f4"
                            />
                        </View>
                        <MenuOption 
                            icon="help-circle"
                            title="Ajuda & Suporte"
                            isLast={true}
                            isComingSoon={true}
                        />
                    </View>
                </View>

                {/* Botão de Sair */}
                <View className="px-6 mb-12">
                    <TouchableOpacity
                        onPress={logout}
                        className="bg-red-50 flex-row items-center justify-center p-4 rounded-2xl border border-red-100"
                    >
                        <Feather name='log-out' size={20} color="#ef4444" />
                        <Text className="ml-2 text-red-500 font-bold text-lg">Sair da Conta</Text>
                    </TouchableOpacity>
                        <Text className="text-center text-gray-300 text-[10px] mt-6 uppercase tracking-tighter">
                            KeePace v1.0.0 • Feito com ❤️
                        </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}