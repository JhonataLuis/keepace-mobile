import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../services/AuthContext';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../services/api';
import { StatusBar } from 'expo-status-bar';

export default function Home({ navigation }) {

    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [ stats, setStats ] = useState({
        total: 0,
        completed: 0,
        pending: 0
    });
    const [streak, setStreak] = useState(0);

    const carregarStreak = async () => {
        try {
            const response = await api.get('/streaks/streak');
            setStreak(response.data.streak);
        } catch (error) {
            console.log("Erro ao carregar streak", error?.response?.status, error?.response?.data);
        }
    };

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
        loadStats(); // carrega statisticas
        carregarStreak(); // carrega streaks
        
        return navigation.addListener('focus', () => {
            loadStats();
            carregarStreak();
        });
    }, [navigation, loadStats]);

    const onRefresh = () => {
        setRefreshing(true);
        loadStats();
    };

    // Componente action card
    const ActionCard = ({ title, icon, color, onPress, description, style }) => (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            //style={style}
            className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-100 flex-1 mx-1"
        >
            <View className={`w-12 h-12 rounded-2xl items-center justify-center mb-4 ${color || ''}`}
            style={style}
            >
                <Feather name={icon} size={24} color="white" />
            </View>
            <Text className="text-gray-800 font-bold text-base">{title}</Text>
            <Text className="text-gray-400 text-xs mt-1">{description}</Text>
        </TouchableOpacity>
    );


    return ( 
        <View className="flex-1 bg-gray-50">
            {/*SafeAreaView evita que o conteúdo fique atrás do notch/camara do celular*/}
            <SafeAreaView edges={['top']} className="bg-white" >
                <StatusBar style="dark" backgroundColor="#ffffff" />
            </SafeAreaView>
            {/* Header Moderno */}
            <View className="px-6 py-6 flex-row justify-between items-center bg-white border-b border-gray-100">
                <View className="flex-1">
                     {/* DATA (embaixo) 
                    <Text className="text-gray-400 text-sm mt-1 capitalize">
                        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit' })}
                    </Text>*/}
                    {/* LINHA: Olá + Nome */}
                    <View className="flex-row items-center">
                        <Text className="text-gray-500 text-sm font-medium mr-1">
                            Olá,
                        </Text>
                        <Text className="text-xl font-bold text-gray-800">
                            {user?.name?.split(' ')[0] || 'Usuário'}! 👋
                        </Text>
                    </View>
                </View>
                <TouchableOpacity 
                    onPress={() => navigation.navigate('Perfil')} 
                    style={{ backgroundColor: '#E2DBF5', borderColor: '#D6E6F5'}}
                    className="w-12 h-12 rounded-full items-center justify-center border-2">
                    <Text style={{ color: '#5B4FA3'}} className="font-bold text-2xl">{user?.name?.charAt(0) || 'U'}</Text>
                </TouchableOpacity>
            </View>
                <ScrollView className="flex-1 px-4"
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5B4FA3" />}
                >
                   {/* STREAK DIAS PRODUTIVOS */}
                    <View className="mt-6 mx-2">
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('StreakScreen')}
                        >
                            <View className="bg-white rounded-3xl p-5 flex-row mr-2 border border-gray-200/50 justify-center"
                            //className="bg-gray-100/50 rounded-3xl p-5 flex-1 mr-2 border border-gray-200/50 items-center justify-center"
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.05,
                                    //shadowRadius: 4,
                                    //elevation: 2,
                                }}
                            >

                                {/* LADO ESQUERDO (streak) */}
                                <View className="flex-row items-center justify-between">
                                    <View style={{ backgroundColor: "#FEE2CC" }} className="w-12 h-12 rounded-2xl items-center justify-center mr-4">
                                        <MaterialCommunityIcons name='fire' size={36} color="#D96A2E" />
                                    </View>

                                    <View>
                                        <Text style={{ color: "#D96A2E"}} className="font-bold text-lg">
                                            {streak} dias produtivos
                                        </Text>

                                        <Text style={{ color: "#F7A866"}} className="text-xs">
                                            {streak === 0 
                                                ? 'Comece hoje 🚀'
                                                : streak < 5 
                                                ? 'Bom começo! Continue assim'
                                                : streak < 10
                                                ? 'Mandando bem! 🔥'
                                                : 'Você está voando 🌟'}
                                        </Text>
                                    </View>
                                </View>
                                {/* LADO DIREITO (opcional) */}
                                <Feather name="trending-up" size={24} color="#D96A2E" />
                            </View>
                        </TouchableOpacity>
                    </View>
                    {/* Dashboard de Estatísticas */}
                    <View className="mt-6 flex-row justify-between items-end">
                        {/* Card TOTAL */}
                        <View 
                            className="bg-gray-100/50 rounded-3xl p-5 flex-1 mr-2 border border-gray-200/50 items-center justify-center"
                        >
                            <Feather name='database' size={20} color="#9ca3af" />
                            <Text className="text-xl font-black text-gray-500">{stats.total || 0}</Text>
                            <Text className="text-gray-400 text-[9px] uppercase font-black">Geral</Text>
                        </View>

                        {/* Card FEITAS */}
                        <TouchableOpacity 
                            onPress={() => navigation.navigate('TarefasConcluidas', { filter: 'completed' })}
                            activeOpacity={0.7}
                            className="bg-white rounded-3xl p-5 flex-[1.2] mx-1 border border-gray-100 items-center shadow-sm"
                        >
                            <Feather name='check-circle' size={20} color={stats.completed > 0 ? "#6E9155" : "#9ca3af"} />
                            <Text className={`text-2xl font-black mt-1 ${stats.completed > 0 ? 'text-gray-800' : 'text-gray-300'}`}>
                                {stats.completed || 0}
                            </Text>
                            <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-widest text-center">Feitas</Text>
                        </TouchableOpacity>

                        {/* Card PENDENTES (Faltam) */}
                        <TouchableOpacity 
                            onPress={() => navigation.navigate('ListaTarefas', { filter: 'pending' })}
                            activeOpacity={0.7}
                            className="bg-white rounded-3xl p-5 flex-[1.2] ml-2 border border-gray-100 items-center shadow-sm"
                        >
                            <Feather name="clock" size={20} color={stats.pending > 0 ? "#D96A2E" : "#9ca3af"} />
                            <Text className={`text-2xl font-black mt-1 ${stats.pending > 0 ? 'text-gray-800' : 'text-gray-300'}`}>
                                {stats.pending || 0}
                            </Text>
                            <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-widest text-center">Faltam</Text>
                        </TouchableOpacity>
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
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Seção de Ações em Grid */}
                    <Text className="text-lg font-semibold text-gray-800 mt-8 mb-4 ml-2">
                        Ações rápidas
                    </Text>

                    <View className="flex-row">
                        <ActionCard 
                            title="Tarefas"
                            description="Ver sua lista"
                            icon="layers"
                            style={{ backgroundColor: "#3C6FA3"}}
                            onPress={() => navigation.navigate('ListaTarefas')}
                        />
                        <ActionCard 
                            title="Nova"
                            description="Criar Tarefa"
                            icon="plus"  
                            style={{ backgroundColor: "#6E9155"}}
                            onPress={() => navigation.navigate('CriarEditarTarefa')}  
                        />
                    </View>

                    <View className="flex-row">
                        <ActionCard 
                            title="Perfil"
                            description="Suas configs"
                            icon="settings"
                            //color="bg-purple-500"
                            style={{ backgroundColor: "#5B4FA3"}}
                            onPress={() => navigation.navigate('Perfil')}
                        />
                        <ActionCard 
                            title="Agenda"
                            description="Tarefas dias"
                            icon="calendar"
                            //color="bg-purple-500"
                            style={{ backgroundColor: "#D96A2E"}}
                            onPress={() => navigation.navigate('Agenda')}
                        />
                    </View>

                    {loading && <ActivityIndicator color="#3C6FA3" className="mt-4" />}
                    
                    <View className="h-20" />
             </ScrollView>
        </View>
    );
}