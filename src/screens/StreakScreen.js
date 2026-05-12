import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../services/AuthContext';
import api from '../services/api';


export default function StreakScreen({ navigation }) {

    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [streak, setStreak] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        today: 0,
        week: 0,
        total: 0
    });
    const [history, setHistory] = useState([]);

    const loadData = async () => {
        try {
            const [streadRes, statsRes, historyRes] = await Promise.all([
                api.get(`/streaks/streak?userId=${user.id}`),
                api.get('/streaks/stats'),
                api.get('/streaks/history')
            ]);

            setStreak(streadRes.data.streak || 0);
            setStats(statsRes.data || { today: 0, week: 0, total: 0 });

            // Formatar o history para o gráfico
            const formattedHistory = historyRes.data.map(item => ({
                ...item,
                label: new Date(item.date).toLocaleDateString('pt-BR', { weekday: 'short' }).substring(0,3)
            }));
            setHistory(formattedHistory);

        } catch (error) {
            console.log("Erro Streak:", error?.response?.status, error?.response?.data);

            // Se for erro de autenticação (403/401)
            if (error?.response?.status === 403 || error?.response?.status === 401) {
                consolele.log("Erro de autenticação na streak");

                // Seta valores padrão
                setStreak(0);
                setStats({ today: 0, week: 0, total: 0 });
                setHistory([]);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    // Carregar dados quando a tela receber foco 
    useFocusEffect(
        useCallback(() => {
            loadData();
            return () => {}; // cleanup opcional
        }, [])
    );

    
    useEffect(() => {
        loadData();
    }, []);

    if (loading) {
            return (
                <View className="flex-1 justify-center items-center bg-gray-50">
                    <ActivityIndicator size='large' style={{ marginTop: 50 }} color="#f97316" />
                </View>
        );
    }

    return(
        <View className="flex-1 bg-gray-50">
            <SafeAreaView edges={['top']} className="bg-white">
                <StatusBar style="dark" backgroundColor="#ffffff"/>
            </SafeAreaView>

            {/* HEADER */}
            <View className="px-6 py-6 bg-white border-b border-gray-100 flex-row items-center">
                <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-100">
                    <TouchableOpacity 
                        onPress={() => navigation?.goBack()} 
                        className="mr-4">
                        <Feather name='arrow-left' size={24} color="#4b5563" />
                    </TouchableOpacity>
                </View>
                <View>
                    <Text className="text-gray-400 text-sm">
                        Seu desempenho
                    </Text>
                    <View className="flex-row items-center mt-1">
                        <Text className="text-lg text-gray-500 mr-1">Olá,</Text>
                        <Text className="text-xl font-bold text-gray-800">
                            {user?.name?.split(' ')[0] || 'Usuário'}
                        </Text>
                    </View>
                </View>
            </View>
            <ScrollView
                className="px-4"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D96A2E" />
                }
                >

                {/* STREAK PRINCIPAL */}
                <View style={{ backgroundColor: "#FEE2CC" }} className="mt-6 bg-orange-50 border border-orange-100 rounded-2xl p-6 items-center">
                    <Text>
                        <MaterialCommunityIcons name='fire' size={36} color="#D96A2E" />
                    </Text>
                    <Text className="text-3xl font-blackmt-2" style={{  color: "#D96A2E" }}>
                        {streak}
                    </Text>

                    <Text className="text-sm" style={{ color: "#D96A2E"}}>
                        dias produtivos seguidos
                    </Text>
                    {streak === 0 && (
                        <Text className="text-xs mt-2 text-center" style={{  color: "#D96A2E" }}>
                            Complete tarefas hoje para começar sua streak!
                        </Text>
                    )}
                </View>

                {/* RESUMO */}
                <View className="flex-row mt-6">
                    <View className="flex-1 bg-white rounded-2xl p-4 mr-2 items-center shadow-sm">
                        <Feather name='calendar' size={20} color="#9ca3af" />
                        <Text className="text-gray-400 text-xs mt-1">Hoje</Text>
                        <Text className="text-xl font-bold" style={{ color: "#6E9155"}}>
                            {stats.today || 0}
                        </Text>
                    </View>

                    <View className="flex-1 bg-white rounded-2xl p-4 mx-1 items-center shadow-sm">
                        <Feather name='bar-chart-2' size={20} color="#9ca3af" />
                        <Text className="text-gray-400 text-xs">Semana</Text>
                        <Text className="text-xl font-bold" style={{ color: "#3C6FA3" }}>
                            {stats.week || 0}
                        </Text>
                    </View>

                    <View className="flex-1 bg-white rounded-2xl p-4 ml-2 items-center shadow-sm">
                        <Feather name='award' size={20} color="#9ca3af" />
                        <Text className="text-gray-400 text-xs">Total</Text>
                        <Text className="text-xl font-bold text-gray-800">
                            {stats.total || 0}
                        </Text>
                    </View>
                </View>

                {/* GRÁFICO SIMPLES (últimos 7 dias) */}
                {history.length > 0 && (

                <>
                <Text className="text-lg font-semibold mt-8 mb-3 text-gray-800">
                    Últimos 7 dias
                </Text>

                <View className="flex-row justify-between items-end bg-white p-4 rounded-2xl">
                    {history.slice(-7).map((day, index) => (
                        <View key={index} className="items-center flex-1">
                            <View 
                                style={{
                                    height: Math.min((day.completed || 0) * 15, 80) // Máximo 80px
                                }}
                                className={`w-8 rounded-full ${
                                    (day.completed || 0) > 0 ? 'bg-green-500' : 'bg-gray-200'
                                }`}
                            />

                            <Text className="text-[10px] text-gray-400 mt-1">
                                {day.label || day.date?.split('-')[2]}
                            </Text>
                            {day.completed > 0 && (
                                <Text className="text-[8px] text-green-600 font-bold">
                                    {day.completed}
                                </Text>
                            )}
                        </View>
                    ))}
                </View>
                </>
                )}

                {/* HISTÓRICO (tipo calendário simples) */}
                {history.length > 0 && (
                    <>
                        <Text className="text-lg font-semibold mt-8 mb-3 text-gray-800">
                            Histórico
                        </Text>

                        <View className="flex-row flex-wrap bg-white p-4 rounded-2xl">
                            {history.slice(-30).map((day, index) => (
                                <View
                                    key={index}
                                    className={`w-7 h-7 m-[2px] rounded-md ${
                                        (day.completed || 0) > 0 ? 'bg-green-500' : 'bg-gray-200'
                                    }`}
                                />
                            ))}
                        </View>
                    </>
                )}

                {/* Mensagem quando não há dados */}
                {history.length === 0 && !loading && (
                    <View className="mt-8 bg-blue-50 p-6 rounded-2xl items-center">
                        <Feather name='caldendar' size={40} color="#3C6FA3" />
                        <Text className="text-blue-800 font-bold text-lg mt-3 text-center">
                            Nenhum registro ainda
                        </Text>
                        <Text className="text-blue-600 text-sm text-center mt-2">
                            Complete tarefas para construir seu histórico de produtividade!
                        </Text>
                    </View>
                )}
                <View className="h-20" />
            </ScrollView>
        </View>
    );
} 