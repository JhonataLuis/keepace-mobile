import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../services/AuthContext';
import { Feather } from '@expo/vector-icons';
import api from '../services/api';

export default function Home({ navigation }) {

    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [ stats, setStats ] = useState({
        total: 0,
        completed: 0,
        pending: 0
    });

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
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        loadStats();
        // O listenner 'focus' atualiza os números ao voltar da tela
       /* const unsubscribe = navigation.addListener('focus', () => {
            loadStats();
        });*/
        return navigation.addListener('focus', loadStats);
    }, [navigation, loadStats]);

    const onRefresh = () => {
        setRefreshing(true);
        loadStats();
    };

    const ActionCard = ({ title, icon, color, onPress, description }) => (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-100 flex-1 mx-1"
        >
            <View className={`w-12 h-12 rounded-2xl items-center justify-center mb-4 ${color}`}>
                <Feather name={icon} size={24} color="white" />
            </View>
            <Text className="text-gray-800 font-bold text-base">{title}</Text>
            <Text className="text-gray-400 text-xs mt-1">{description}</Text>
        </TouchableOpacity>
    );


    return ( 
        // SafeAreaView evita que o conteúdo fique atrás do notch/camara do celular
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header Moderno */}
            <View className="px-6 py-6 flex-row justify-between items-center bg-white border-b border-gray-100">
                <View>
                    <Text className="text-gray-400 text-sm font-medium">Olá,</Text>
                    <Text className="text-2xl font-bold text-gray-800">{user?.name?.split(' ')[0] || 'Usuário'}!</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Perfil')} className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center border-2 border-blue-50">
                    <Text className="text-blue-600 font-bold text-lg">{user?.name?.charAt(0) || 'U'}</Text>
                </TouchableOpacity>
            </View>
                <ScrollView className="flex-1 px-4"
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >

                    {/* Dashboard de Estatísticas */}
                    <View className="mt-6 flex-row justify-between">
                        <View className="bg-white rounded-3xl p-5 flex-1 mr-2 border border-gray-100 items-center">
                            <Feather name='list' size={20} color={stats.total > 0 ? "#3b82f6" : "#9ca3af"} />
                            <Text className={`text-2xl font-black text-gray-800 mt-2 ${stats.total > 0 ? 'text-gray-800' : 'text-gray-300'}`}>
                                {stats.total || 0}
                            </Text>
                            <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-widest text-center">Total</Text>
                        </View>
                        <View className="bg-white rounded-3xl p-5 flex-1 mx-1 border border-gray-100 items-center">
                            <Feather name='check-circle' size={20} color={stats.completed > 0 ? "#10b981" : "#9ca3af"} />
                            <Text className={`text-2xl font-black mt-2 ${stats.completed > 0 ? 'text-gray-800' : 'text-gray-300'}`}>
                                {stats.completed || 0}
                            </Text>
                            <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-widest text-center">Feitas</Text>
                        </View>
                        <View className="bg-white rounded-3xl p-5 flex-1 ml-2 border border-gray-100 items-center">
                            <Feather name="clock" size={20} color={stats.pending > 0 ? "#f59e0b" : "#9ca3af"} />
                            <Text className={`text-2xl font-black text-gray-800 mt-2 ${stats.pending > 0 ? 'text-gray-800' : 'text-gray-300'}`}>
                                {stats.pending || 0}
                            </Text>
                            <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-widest text-center">Faltam</Text>
                        </View>
                    </View>

                    {/* Bloco para primeiro acesso sem tarefas cadastrada no App */}
                    {stats.total === 0 && !loading && (
                        <View className="mt-6 bg-blue-50 p-6 rounded-3xl border border-blue-100 items-center">
                            <View className="bg-blue-600 w-10 h-10 rounded-full items-center justify-center mb-3">
                                <Feather name='star' size={20} color="white" />
                            </View>
                            <Text className="text-blue-900 font-bold text-lg text-center">
                                Pronto para começar?
                            </Text>
                            <Text className="text-blue-700 text-center text-sm mt-1 px-4">
                                Crie sua primeira tarefa para organizar seu dia e ver sua evolução aqui!
                            </Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('CriarEditarTarefa')}
                                className="mt-4 bg-blue-600 px-6 py-2 rounded-full items-center"
                            >
                                <Feather name='plus' size={20} color="white" />
                                <Text className="text-white font-bold">Criar Agora</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Seção de Ações em Grid */}
                    <Text className="text-lg font-bold text-gray-800 mt-8 mb-4 ml-2">
                        Ações rápidas
                    </Text>

                    <View className="flex-row">
                        <ActionCard 
                            title="Tarefas"
                            description="Ver sua lista"
                            icon="layers"
                            color="bg-blue-500"
                            onPress={() => navigation.navigate('ListaTarefas')}
                        />
                        <ActionCard 
                            title="Nova"
                            description="Criar Tarefa"
                            icon="plus"  
                            color="bg-green-500"
                            onPress={() => navigation.navigate('CriarEditarTarefa')}  
                        />
                    </View>

                    <View className="flex-row">
                        <ActionCard 
                            title="Perfil"
                            description="Suas configs"
                            icon="settings"
                            color="bg-purple-500"
                            onPress={() => navigation.navigate('Perfil')}
                        />
                        <TouchableOpacity
                            onPress={logout}
                            activeOpacity={0.7}
                            className="bg-red-50 rounded-3xl p-5 mb-4 flex-1 mx-1 items-center justify-center border border-red-100"
                        >
                            <Feather name="log-out" size={24} color="#ef4444" />
                            <Text className="text-red-500 font-bold mt-2">Sair</Text>
                        </TouchableOpacity>
                    </View>

                    {loading && <ActivityIndicator color="#3b82f6" className="mt-4" />}
                    
                    <View className="h-20" />
               
             </ScrollView>
        </SafeAreaView>
    );
}