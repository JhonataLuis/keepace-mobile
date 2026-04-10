import React, { useState } from 'react';
import { Image, View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../services/AuthContext';

export default function Perfil({ navigation }) {
    const { user, logout } = useAuth();

    const BASE_URL = "http://192.168.5.115:8080";

    console.log("Perfil:", user);
    console.log("Nome USER:", user?.name);

    const MenuOption = ({ icon, title, subtitle, onPress, color = "text-gray-700", isLast = false }) => (
        <TouchableOpacity
          onPress={onPress}
          className={`flex-row items-center py-4 ${!isLast ? 'border-b border-gray-100' : ''}`}
        >
            <View className="bg-blue-100 p-2 rounded-lg">
                <Feather name={icon} size={20} color="#3b82f6"/>
            </View>
            <View className="flex-1 ml-4">
                <Text className={`text-base font-semibold ${color}`}>{title}</Text>
                {subtitle && <Text className="text-xs text-gray-400">{subtitle}</Text>}
            </View>
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
                            //onPress={() => } lógica para trocar a foto
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
                        onPress={() => {}}
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
                        onPress={() => {}}
                        />
                    </View>
                </View>

                {/* Seção: App & Preferências  */}
                <View className="px-5 mb-6">
                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Preferências</Text>
                    <View className="bg-white rounded-3xl px-4 shadow-sm border border-blue-100">
                        <View className="flex-row items-center py-4 border-b border-gray-100">
                            <View className="bg-blue-100 p-2 rounded-lg">
                                <Feather name='moon' size={20} color="#3b82f6" />
                            </View>
                            <View className="flex-1 ml-4">
                                <Text className="text-base font-semibold text-gray-700">Modo Escuro</Text>
                            </View>
                            <Switch 
                             trackColor={{ false: "#d1d5db", true: "#bfdbfe" }}
                             thumbColor={true ? "#3b82f6" : "#f4f3f4"}
                            />
                        </View>
                        <MenuOption 
                         icon="help-circle"
                         title="Ajuda & Suporte"
                         onPress={() => {}}
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
                        <Text className="text-center text-gray-300 text-xs mt-6">
                            KeePace v1.0.0
                        </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}