import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../services/AuthContext';
//import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback } from 'react';
import { Feather } from '@expo/vector-icons';
import api from '../services/api';

export default function Home({ navigation }) {

    const { user, logout } = useAuth();
    const [ stats, setStats ] = useState({
        total: 0,
        completed: 0,
        pending: 0
    });

    useEffect(() => {
        loadStats();
        // O listenner 'focus' atualiza os números ao voltar da tela
        const unsubscribe = navigation.addListener('focus', () => {
            loadStats();
        });
        return unsubscribe;
    }, [navigation]);

    const loadStats = useCallback(async () => {
        try {
            const response = await api.get('/tasks/stats');

            if (response.data) {
                setStats({
                    total: response.data.total,
                    completed: response.data.completed,
                    pending: response.data.pending
                });
            }
                
        } catch (error) {
            console.error("Erro ao carregar estats do Java:", error);
        }
    }, [user]);

    return ( 
        // SafeAreaView evita que o conteúdo fique atrás do notch/camara do celular
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 bg-gray-100">
                <ScrollView className="flex-1 p-3">
                    <Text className="text-3xl font-bold text-gray-800 mb-2">
                        Olá, { user?.name || 'Usuário'}!
                    </Text>
                    <Text className="text-gray-600 text-base mb-8">
                        Bem-vindo ao seu organizador de tarefas
                    </Text>

                    {/* Cards de estatísticas */}
                    <View className="flex-row justify-between mb-8">
                        <View className="bg-white rounded-2xl p-4 flex-1 mr-3 shadow-sm">
                            <Text className="text-gray-500 text-xs uppercase">Total</Text>
                            <Text className="text-2xl font-bold text-blue-600">{stats.total}</Text>
                        </View>
                        <View className="bg-white rounded-2xl p-4 flex-1 mr-2 shadow-sm">
                            <Text 
                                numberOfLines={1}
                                className="text-gray-500 text-xs uppercase">Concluídas</Text>
                            <Text className="text-2xl font-bold text-green-600">{stats.completed}</Text>
                        </View>
                        <View className="bg-white rounded-2xl p-4 flex-1 shadow-sm">
                            <Text className="text-gray-500 text-xs uppercase">Pendentes</Text>
                            <Text className="text-2xl font-bold text-orange-600">{stats.pending}</Text>
                        </View>
                    </View>

                    {/* Menu rápido */}
                    <Text className="text-xl font-bold text-gray-800 mb-4">
                        Ações Rápidas
                    </Text>

                    <TouchableOpacity 
                    className="bg-blue-600 rounded-xl p-4 flex-row mb-4 justify-between items-center"
                    onPress={() => navigation.navigate('ListaTarefas')}
                    >
                        <Text className="text-white text-lg font-semibold">Minhas Tarefas</Text>
                        <Feather name="arrow-right" size={25} color="white"/>
                    </TouchableOpacity>

                    <TouchableOpacity 
                     className="bg-green-600 rounded-xl p-4 mb-4 flex-row justify-between items-center"
                     onPress={() => navigation.navigate('CriarEditarTarefa')}
                    >
                        <Text className="text-white text-lg font-semibold">Nova Tarefa</Text>
                        <Feather name='plus' size={25} color="white"/>
                    </TouchableOpacity>

                    <TouchableOpacity className="bg-purple-600 rounded-xl p-4 mb-4 flex-row justify-between items-center">
                        <Text className="text-white text-lg font-semibold">Meu Perfil</Text>
                        <Feather name='user' size={25} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                         className="bg-red-600 rounded-xl p-4 mt-4 flex-row justify-between items-center"
                         onPress={logout}>
                        <Text className="text-white text-lg font-semibold">Sair</Text>
                        <Feather name='log-out' size={25} color="white"/>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}