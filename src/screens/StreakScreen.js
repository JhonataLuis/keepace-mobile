import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../services/AuthContext';
import api from '../services/api';

const { width: screenWidth } = Dimensions.get('window');


export default function StreakScreen({ navigation }) {

    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [streak, setStreak] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        today: 0,
        week: 0,
        total: 0,
        yesterday: 0
    });
    const [history, setHistory] = useState([]);
    const [chartPeriod, setChartPeriod] = useState('week'); // 'day', 'week', 'month'
    const [trendPeriod, setTrendPeriod] = useState('week'); // 'day', 'week'
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [{ data: [] }]
    });

    const [trendData, setTrendData] = useState({
        labels: [],
        datasets: [{ data: [] }]
    });

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
            const formattedHistory = historyRes.data.map(item => {
                const [year, month, day] = item.date.split('-');
                const localDate = new Date(year, month - 1, day); // pega o dia correto
                
                return {
                ...item,
                label: localDate.toLocaleDateString('pt-BR', { weekday: 'short' }).substring(0,3),
                day: day,
                month: month,
                year: year
            };
        }).sort((a, b) => new Date(a.date) - new Date(b.date));

            setHistory(formattedHistory);
            updateChartData(formattedHistory, chartPeriod);
            updateTrendData(formattedHistory, trendPeriod);

        } catch (error) {
            console.log("Erro Streak:", error?.response?.status, error?.response?.data);

            // Se for erro de autenticação (403/401)
            if (error?.response?.status === 403 || error?.response?.status === 401) {
                console.log("Erro de autenticação na streak");

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

    const updateChartData = (data, period) => {
        const today = new Date();

        // Garantir que temos exatamente os últimos 7/30 dias com zeros para dias sem dados
        const labels = [];
        const values = [];
        const daysToShow = period === 'day' ? 1 : period === 'week' ? 7 : 30;

        for (let i = daysToShow - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const found = data.find(d => d.date === dateStr);
            const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' }).substring(0, 3);
            labels.push(dayName);
            values.push(found?.completed || 0);
        }

        setChartData({
            labels: labels,
            datasets: [{ data: values }]
        });
    };

    const updateTrendData = (data, period) => {
        const today = new Date();
        const daysToShow = period === 'day' ? 1 : period === 'week' ? 7 : 30;
        
        const labels = [];
        const values = [];
        
        for (let i = daysToShow - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const found = data.find(d => d.date === dateStr);
            const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' }).substring(0, 3);
            labels.push(dayName);
            const percentage = found?.completed ? (found.completed / (found.total || 1)) * 100 : 0;
            values.push(percentage);
        }
        
        setTrendData({
            labels: labels,
            datasets: [{ data: values }]
        });
    };

    const handleChartPeriodChange = (period) => {
        setChartPeriod(period);
        updateChartData(history, period);
    };

    const handleTrendPeriodChange = (period) => {
        setTrendPeriod(period);
        updateTrendData(history, period);
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
                    <TouchableOpacity 
                        onPress={() => navigation?.goBack()} 
                        className="mr-4">
                            <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
                                <MaterialCommunityIcons name='arrow-left' size={24} color="#6B7280" />
                            </View>
                    </TouchableOpacity>
                <View>
                    <View className="flex-row items-center mt-1">
                         <Text className="text-lg font-semibold text-gray-800">
                        Seu desempenho
                    </Text>
                    </View>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-4"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D96A2E" />
                }
                showsVerticalScrollIndicator={false}
                >

                {/* STREAK PRINCIPAL */}
                <View style={{ backgroundColor: "#FFF5ED" }} className="mt-6 rounded-2xl p-6 items-center border border-orange-100">
                    <View className="flex-row items-center justify-center mb-2">
                        <MaterialCommunityIcons name='fire' size={32} color="#D96A2E" />
                        <Text className="text-4xl font-bold ml-2" style={{  color: "#D96A2E" }}>
                            {streak}
                        </Text>
                    </View>
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
                        <View className="w-10 h-10 rounded-full bg-green-50 items-center justify-center mb-2">
                            <MaterialCommunityIcons name='calendar' size={20} color="#6E9155" />
                        </View>
                        <Text className="text-gray-500 text-xs font-medium">Hoje</Text>
                        <Text className="text-2xl font-bold mt-1" style={{ color: "#6E9155"}}>
                            {stats.today || 0}
                        </Text>
                    </View>

                    <View className="flex-1 bg-white rounded-2xl p-4 mx-1 items-center shadow-sm">
                        <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mb-2">
                            <MaterialCommunityIcons name='chart-bar' size={20} color="#3C6FA3" />
                        </View>
                        <Text className="text-gray-500 text-xs font-medium">Semana</Text>
                        <Text className="text-2xl font-bold mt-1" style={{ color: "#3C6FA3" }}>
                            {stats.week || 0}
                        </Text>
                    </View>

                    <View className="flex-1 bg-white rounded-2xl p-4 ml-2 items-center shadow-sm">
                        <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mb-2">
                           <Feather name='award' size={20} color="#6B7280" />
                        </View>
                        <Text className="text-gray-500 text-xs font-medium">Total</Text>
                        <Text className="text-2xl font-bold mt-1 text-gray-800">
                            {stats.total || 0}
                        </Text>
                    </View>
                </View>

                {/* CURVA DE CONCLUSÃO RECENTE */}
                <View className="mt-8 bg-white rounded-2xl p-4 shadow-sm">
                    <Text className="text-lg font-semibold text-gray-800 mb-4">
                        Conclusão Recente
                    </Text>

                    {/* Seletores */}
                    <View className="flex-row mb-4">
                        {['day', 'week', 'month'].map((period) => (
                            <TouchableOpacity
                                key={period}
                                onPress={() => handleChartPeriodChange(period)}
                                className={`mr-3 px-4 py-1.5 rounded-full ${
                                    chartPeriod === period ? 'bg-blue-500' : 'bg-gray-100'
                                }`}
                            >
                                <Text className={`text-xs font-medium ${
                                    chartPeriod === period ? 'text-white' : 'text-gray-600'
                                }`}>
                                    {period === 'day' ? 'Dia' : period === 'week' ? 'Semana' : 'Mês'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Gráfico de barras */}
                    {chartData.datasets[0].data.length > 0 && chartData.datasets[0].data.some(v => v > 0) ? (
                        <View>
                            <View className="flex-row justify-between items-end h-48 mt-4">
                                {chartData.datasets[0].data.map((value, index) => {
                                    const maxValue = Math.max(...chartData.datasets[0].data, 10);
                                    const height = (value / maxValue) * 160;
                                    return (
                                        <View key={index} className="items-center flex-1">
                                            <View className="items-center">
                                                <View
                                                    style={{ 
                                                        height: Math.max(height, 4),
                                                        width: 18,
                                                        borderRadius: 4,
                                                        minHeight: 4
                                                    }}
                                                    className={`w-6 ${
                                                        value > 0 ? 'bg-green-500' : 'bg-gray-200'
                                                    }`}
                                                />

                                                {value > 0 && (
                                                    <Text className="text-[10px] text-green-600 font-bold mt-1">
                                                        {value}
                                                    </Text>
                                                )}
                                            </View>
                                            <Text className="text-[10px] text-gray-400 mt-2">
                                                {chartData.labels[index]}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>

                            {/* Linha de média */}
                            <View className="flex-row justify-between mt-4 pt-4 border-t border-gray-100">
                                <Text>Meta diária: 5 tarefas</Text>
                            </View>
                        </View>
                    ) : (
                        <View className="h-40 items-center justify-center">
                            <MaterialCommunityIcons name='chart-bar' size={40} color="#D1D5DB" />
                            <Text className="text-gray-400 mt-2">Sem dados para exibir</Text>
                            <Text className="text-gray-300 text-xs mt-1">Complete tarefas para ver seu progresso</Text>
                        </View>
                    )}
                </View>

                {/* TENDÊNCIA DE TAXA DE CONCLUSÃO */}
                <View className="mt-6 bg-white rounded-2xl p-4 shadow-sm mb-8 overflow-hidden">
                    <Text className="text-lg font-semibold text-gray-800 mb-4">
                        Tendência de Conclusão Recente
                    </Text>

                    {/* Seletores */}
                    <View className="flex-row mb-4">
                        {['day', 'week'].map((period) => (
                            <TouchableOpacity
                                key={period}
                                onPress={() => handleTrendPeriodChange(period)}
                                className={`mr-3 px-4 py-1.5 rounded-full ${
                                    trendPeriod === period ? 'bg-blue-500' : 'bg-gray-100'
                                }`}
                            >
                                <Text className={`text-xs font-medium ${
                                    trendPeriod === period ? 'text-white' : 'text-gray-600'
                                }`}>
                                    {period === 'day' ? 'Dia' : 'Semana'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Gráfico de Linha de Porcentagem */}
                    {trendData.datasets[0].data.length > 0 && trendData.datasets[0].data.some(v => v > 0) ? (
                        <View>
                            <View className="flex-row justify-between mt-4 px-1">
                                {trendData.datasets[0].data.map((value, index) => (
                                    <View key={index} className="items-center flex-1">

                                            {/* Valor */}
                                            <Text className="text-[10px] text-gray-500 mb-1">
                                                {value.toFixed(0)}%
                                            </Text>

                                            {/* Área da barra */}
                                        <View className="justify-end items-center">
                                            <View 
                                                style={{ 
                                                    height: Math.max((value / 100) * 70, 6),
                                                    width: 18,
                                                    backgroundColor: value > 70 ? '#10B981' : value > 40 ? '#F59E0B' : '#EF4444',
                                                    borderRadius: 4,
                                                }}
                                            />
                                        </View>

                                        {/* Label */}
                                        <Text className="text-[10px] text-gray-400 mt-2">
                                            {trendData.labels[index]}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                             {/* Legenda */}
                            <View className="flex-row flex-wrap justify-center mt-6 pt-4 border-t border-gray-100">
                                <View className="flex-row items-center mr-4 mb-2">
                                    <View className="w-3 h-3 rounded-full bg-green-500 mr-1" />
                                    <Text className="text-xs text-gray-500">Alta (&gt;70%)</Text>
                                </View>
                                <View className="flex-row items-center mr-4 mb-2">
                                    <View className="w-3 h-3 rounded-full bg-yellow-500 mr-1" />
                                    <Text className="text-xs text-gray-500">Média (40-70%)</Text>
                                </View>
                                <View className="flex-row items-center mb-2">
                                    <View className="w-3 h-3 rounded-full bg-red-500 mr-1" />
                                    <Text className="text-xs text-gray-500">Baixa (&lt;40%)</Text>
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View className="h-40 items-center justify-center">
                            <Feather name="trending-up" size={40} color="#D1D5DB" />
                            <Text className="text-gray-400 mt-2">Sem dados para exibir</Text>
                            <Text className="text-gray-300 text-xs mt-1">Complete tarefas para ver sua tendência</Text>
                        </View>
                    )}
                </View>

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
                        <Feather name='calendar' size={40} color="#3C6FA3" />
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