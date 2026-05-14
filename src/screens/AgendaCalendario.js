import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../services/api';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';

// Configurar localidade em português
LocaleConfig.locales['pt-br'] = {
    monthNames: [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ],
    monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

// Função para obter a data atual no formato YYYY-MM-DD considerando o fuso horário local
const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function AgendaCalendario({ navigation }) {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [markedDates, setMarkedDates] = useState({});
    const [activeRoute, setActiveRoute] = useState('Agenda'); // Para controlar o botão ativo

    // Obter data atual
    const todayDate = getTodayDate();

    // Função para verificar se a rota está ativa
    const isActive = (routeName) => {
        return activeRoute === routeName;
    };

    const loadTasks = async () => {
        try {
            const response = await api.get('/tasks/tarefas/paginadas?page=0&size=100');
            if (response.data && response.data.content) {
                setTasks(response.data.content);
                
                // Criar marcadores para o calendário baseado nas tarefas
                const marked = {};
                response.data.content.forEach(task => {
                    if (task.dueDate) {
                        const date = task.dueDate.split('T')[0];
                        if (!marked[date]) {
                            marked[date] = {
                                marked: true,
                                dotColor: task.completed ? '#6E9155' : '#5B4FA3'
                            };
                        }
                    }
                });
                setMarkedDates(marked);
            }
        } catch (error) {
            console.log("Erro ao carregar tarefas:", error?.response?.status);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Função chamada ao pressionar um dia
    const onDayPress = (day) => {
        setSelectedDate(day.dateString);
        console.log('Data selecionada:', day.dateString);
    };

    // Filtrar tarefas pela data selecionada
    const getTarefasPorData = () => {
        if (!selectedDate) return [];
        return tasks.filter(task => {
            if (!task.dueDate) return false;
            const taskDate = task.dueDate.split('T')[0];
            return taskDate === selectedDate;
        });
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadTasks();
    };

    useFocusEffect(
        useCallback(() => {
            loadTasks();
            // Selecionar automaticamente a data atual ao entrar na tela
            setSelectedDate(todayDate);
        }, [])
    );

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: '#E2DBF5' }}>
                <ActivityIndicator size="large" color="#5B4FA3" />
            </View>
        );
    }

    const tarefasDoDia = getTarefasPorData();

    return (
        <View className="flex-1 bg-gray-50" >
            <SafeAreaView edges={['top']} style={{ backgroundColor: "#5b4fa3"}}>
                <StatusBar style="light" backgroundColor="#ffffff" />
                <View className="px-4 py-4 flex-row items-center justify-between">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Feather name="arrow-left" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-lg font-bold">Calendário de Tarefas</Text>
                    <TouchableOpacity 
                        style={{
                            
                        }}
                        onPress={() => navigation.navigate('CriarEditarTarefa')}
                    >
                        <Feather name="plus" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView 
                className="flex-1"
                contentContainerStyle={{
                    paddingBottom: 100 + insets.bottom
                }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5B4FA3" />
                }
            >
                {/* Calendário */}
                <Calendar
                current={todayDate}
                    //current={new Date().toISOString().split('T')[0]}
                    onDayPress={onDayPress}
                    enableSwipeMonths={true}
                    markedDates={{
                        ...markedDates,
                        // Marcar a data selecionada (pode ser hoje ou outra data clicada)
                        [selectedDate]: {
                            selected: true,
                            selectedColor: '#6E9155',
                            selectedTextColor: '#ffffff',
                            marked: markedDates[selectedDate]?.marked || false,
                            dotColor: markedDates[selectedDate]?.dotColor
                        }
                    }}
                    theme={{
                        backgroundColor: '#ffffff',
                        calendarBackground: '#ffffff',
                        textSectionTitleColor: '#5B4FA3',
                        selectedDayBackgroundColor: '#6E9155',
                        selectedDayTextColor: '#ffffff',
                        todayBackgroundColor: 'transparent', // Remove fundo do today
                        todayTextColor: '#ffffff', // Deixa o texto do today com a cor roxo
                        
                        dayTextColor: '#2d4150',
                        textDisabledColor: '#d9e1e8',
                        arrowColor: '#5B4FA3',
                        monthTextColor: '#5B4FA3',
                        textMonthFontWeight: 'bold',
                        textDayFontSize: 16,
                        textMonthFontSize: 20,
                    }}
                />

                {/* Tarefas do dia selecionado */}
                <View className="px-2 pt-4 pb-2" style={{ minHeight: 200 }}>
                    <Text className="text-lg font-bold mb-4" style={{ color: '#5B4FA3' }}>
                        {selectedDate ? (
                            `📅 ${selectedDate.split('-').reverse().join('/')}`
                        ) : (
                            "📅 Selecione uma data"
                        )}
                    </Text>

                    {selectedDate ? (
                        tarefasDoDia.length > 0 ? (
                            tarefasDoDia.map(task => (
                                <TouchableOpacity
                                    key={task.id}
                                    onPress={() => navigation.navigate('CriarEditarTarefa', { taskId: task.id })}
                                    className="bg-white rounded-2xl p-4 mb-2 w-full"
                                    style={{
                                        borderLeftWidth: 4,
                                        elevation: 2,
                                        shadowOpacity: 0.05,
                                        shadowRadius: 3,
                                        opacity: task.completed ? 0.55 : 1,
                                        borderLeftColor: task.concluido ? '#9CA3AF' : '#5B4FA3'
                                    }}
                                >
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-1">
                                            <Text className={`font-bold ${
                                                task.concluido
                                                    ? 'text-gray-400 line-through'
                                                    : 'text-gray-800'
                                            }`}

                                            >
                                                {task.titulo}
                                            </Text>
                                            {task.descricao && (
                                                <Text 
                                                    numberOfLines={1} // Limita a 1 linha
                                                    ellipsizeMode='tail' // Adiciona '...' no final
                                                    className={`text-xs mt-1 ${
                                                        task.completed
                                                            ? 'text-gray-300 line-through'
                                                            : 'text-gray-400'
                                                    }`} 
                                               >
                                                    {task.descricao}
                                                </Text>
                                            )}
                                            <View className="flex-row items-center mt-2">
                                                <Feather 
                                                    name={task.concluido ? "check-circle" : "clock"} 
                                                    size={12} 
                                                    color={task.concluido ? "#6E9155" : "#5B4FA3"} 
                                                />
                                                <Text className="text-xs text-gray-400 ml-1">
                                                    {task.concluido ? "Concluída" : "Pendente"}
                                                </Text>
                                                <Text className="text-xs text-gray-800 ml-1">
                                                    {task.title}
                                                </Text>
                                            </View>
                                        </View>
                                        <Feather 
                                        name="chevron-right" 
                                        size={20} 
                                        color={task.concluido ? "#D1D5DB" : "#9CA3AF"} />
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View className="items-center justify-center py-10">
                                <Feather name="calendar" size={48} color="#E2DBF5" />
                                <Text className="text-gray-400 text-center mt-4">
                                    ✨ Nenhuma tarefa para este dia
                                </Text>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('CriarEditarTarefa', { defaultDate: selectedDate })}
                                    style={{ backgroundColor: '#3C6FA3' }}
                                    className="mt-4 px-6 py-2 rounded-full"
                                >
                                    <Text className="text-white font-medium">Adicionar tarefa</Text>
                                </TouchableOpacity>
                            </View>
                        )
                    ) : (
                        <View className="items-center justify-center py-10">
                            <Feather name="calendar-range" size={48} color="#E2DBF5" />
                            <Text className="text-gray-400 text-center mt-4">
                                🗓️ Toque em um dia no calendário
                            </Text>
                            <Text className="text-gray-300 text-center text-sm mt-2">
                                para ver as tarefas do dia
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* --- Footer Fixo com 4 Botões --- */}
                        <View
                             style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 15, // Se não tiver barra (gestos), usa 15px
                                height: 70 + (insets.bottom > 0 ? insets.bottom : 0)
                             }}
                                className="absolute bottom-0 w-full bg-white flex-row justify-around items-center py-4 border-t border-gray-100 shadow-xl"
                             >
                            {/* HOME */}
                            <TouchableOpacity
                                className="items-center" 
                                onPress={() => navigation.navigate('Home')}
                                className="items-center"
                                >
                                <Animated.View style={{ 
                                    //backgroundColor: homeStyles.backgroundColor,
                                    padding: 8,
                                    borderRadius: 12,
                                    //transform: [{ scale: homeStyles.scale }]
                                }}>
                                  <Animated.View>
                                        <Feather name="home" size={24} color={isActive('Home') ? '#6E9155' : '#9ca3af'} />
                                   </Animated.View>
                                </Animated.View>
                               <Animated.Text style={{
                                    fontSize: 10,
                                    //color: homeStyles.color
                               }}>
                                    Início
                               </Animated.Text>
                            </TouchableOpacity>
                            {/* TAREFAS */}
                            <TouchableOpacity 
                                onPress={() => navigation.navigate('ListaTarefas')}
                                className="items-center"
                                >
                            <Animated.View style={{
                                //backgroundColor: tarefasStyles.backgroundColor,
                                padding: 8,
                                borderRadius: 12,
                                //transform: [{ scale: tarefasStyles.scale }]
                            }}>
                                <Feather name="list" size={24} color={isActive('ListaTarefas') ? '#6E9155' : '#9ca3af'} />
                            </Animated.View>
                            <Animated.Text style={{ fontSize: 10 }}>
                                Tarefas
                            </Animated.Text>
                            </TouchableOpacity>
            
                            {/* AGENDA */}
                            <TouchableOpacity 
                            onPress={() => navigation.navigate('Agenda')}
                                className="items-center">
                                <Animated.View style={{
                                    //backgroundColor: agendaStyles.backgroundColor,
                                    padding: 8,
                                    borderRadius: 12,
                                    //transform: [{ scale: agendaStyles.scale }]
                                }}>
                                <Feather 
                                    name="calendar" 
                                    size={24} 
                                    color={isActive('Agenda') ? '#6E9155' : '#9ca3af'} 
                                />
                                </Animated.View>
                                <Animated.Text style={{ fontSize: 10 }}>
                                    Agenda
                                </Animated.Text>
                            </TouchableOpacity>
            
                            {/* PERFIL */}
                            <TouchableOpacity onPress={() => navigation.navigate('Perfil')} className="items-center">
                                <Animated.View style={{
                                    //backgroundColor: perfilStyles.backgroundColor,
                                    padding: 8,
                                    borderRadius: 12,
                                    //transform: [{ scale: perfilStyles.scale }]
                                }}>
                                    <Feather name="user" size={24} color={isActive('Perfil') ? '#6E9155' : '#9ca3af'} />
                                </Animated.View>
            
                                <Animated.Text style={{ fontSize: 10 }}>
                                    Conta
                                </Animated.Text>
                                </TouchableOpacity>
                            </View>
            
        </View>
    );
}