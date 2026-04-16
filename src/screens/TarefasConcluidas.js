import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Modal, Alert, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets  } from 'react-native-safe-area-context';
import { Feather} from '@expo/vector-icons';
import api from '../services/api';
import Toast from 'react-native-toast-message';

export default function TarefasConcluidas({ navigation }) {
    const insets = useSafeAreaInsets();

    const [completedTasks, setCompletedTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [menuVisible, setMenuVisible] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null); // Tarefa clicada
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);


    useEffect(() => {
        fetchDoneTasks();
    }, []);


    const fetchDoneTasks = async () => {
        try {
            console.log('Tentando carregar tarefas concluídas...')
            // Rota do backend para listar tarefas concluídas
            const response = await api.get('/tasks/tarefas/paginadas?page=0&size=50&concluido=true');
            
            setCompletedTasks(response.data.content || []);
            console.log('Tarefas', response.data.content);
            //console.log('Name user', response.data.content.user.username);
        } catch (error) {
            console.error(error);
            console.error("Erro ao buscar tarefas:", error);
        } finally {
            setLoading(false);
        }
    };

    // Função paa restaurar tarefa (desmarcar como concluída)
    const handleRestaurar = async (task) => {
        try {
            // Endpoint aceite PATCH para restaurar a tarefa concluída
            await api.patch(`/tasks/tarefas/${task.id}/restaurar`);

            setCompletedTasks(prev => prev.filter(t => t.id !== task.id));
            Toast.show({ 
                type: 'success',
                text1: 'Tarefa restaurada!',
                position: 'top',
                topOffset: 300,
                visibilityTime: 3000, // Define quanto tempo o tast fica visível
                autoHide: true, // Define se o toast some sozinho
            });

        } catch (error) {
            Toast.show({type: 'error', text1: 'Erro ao restaurar'});
            console.log("Erro detalhado: ", error.response?.data);
        }
    };

    const openDeleteDialog = (item) => {
        setSelectedTask(item);
        setIsDeleteModalVisible(true);
    };

        // Função excluir a tarefa do usuário
    const deletarTarefaApi = async (id) => {

        if (!id) return; // Segurança extra

        try {
            setLoading(false); // Se tiver um estado de loading global

            // Chamada ao endpoint para deletar tarefa
            await api.delete(`/tasks/tarefas/${id}`);

            // Filtra as tarefas para remover a que foi deletada
            setCompletedTasks(prevTasks => prevTasks.filter(task => task.id !== id));

            Toast.show({ 
                type: 'delete',
                text1: 'Tarefa removida!',
                position: 'top',
                topOffset: 300,
                visibilityTime: 4000,  // Define quanto tempo o tast fica visível
                autoHide: true, // Define se o toast some sozinho
            });
        } catch (error) {
            console.error("Erro ao deletar:", error);
            const msg = error.response?.status === 404 
                ? "Tarefa não encontrada ou acesso negado." 
                : "Não foi possível excluir a tarefa.";
                
            Toast.show({
                type: 'error',
                text1: 'Falha ao excluir',
                text2: msg,
            });
        } finally {
            setLoading(false);
            setIsDeleteModalVisible(false); // Fecha o modal após terminar
            setSelectedTask(null); // Limpa a tarefa selecionada
        }
    };

    const formatarData = (dataString) => {
        if (!dataString) return 'Sem registro';
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    const getCorPrioridade = (p) => {
        switch(p?.toUpperCase()) {
            case 'ALTA': return 'bg-red-500';
            case 'MEDIA': return 'bg-yellow-500';
            case 'BAIXA': return 'bg-blue-500';
            default: return 'bg-gray-300'
        }
    };

    const renderItem = ({ item }) => (
        <Pressable
            style={({ pressed }) => [
                { transform: [{ scale: pressed ? 0.98 : 1 }] }
            ]}
            className="bg-white mx-3 mb-4 rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
                <View 
                    style={{ backgroundColor: getCorPrioridade(item.prioridade) === 'bg-red-500' ? '#ef4444' : 
                                       getCorPrioridade(item.prioridade) === 'bg-yellow-500' ? '#eab308' : 
                                       getCorPrioridade(item.prioridade) === 'bg-blue-500' ? '#3b82f6' : '#d1d5db' }}
            className="absolute left-0 top-0 bottom-0 w-2"
                    />
                    <View className="p-5 flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                        {/* Check ícone decorativo */}
                        <View className="bg-green-100 p-3 rounded-full">
                            <Feather name='check' size={18} color="#16a34a" />
                        </View>
                    
                        {/* Conteúdo central */}
                        <View className="ml-4 flex-1 pr-2">
                            <Text
                                numberOfLines={1}
                                className="text-gray-400 font-medium text-lg line-through leading-tight">
                                {item.titulo}
                            </Text>
                            <View className="flex-row items-center mt-2">
                                <Feather name='calendar' size={12} color="#9ca3af" />
                                <Text className="text-xs text-gray-400 ml-1.5 font-medium" >
                                    {formatarData(item.updatedAt)}
                                </Text>
                            </View>
                            </View>
                        </View>

                        {/* Ações do Card */}
                        <View className="flex-row items-center">
                        {/* Botão Restaurar */}
                        <TouchableOpacity 
                            onPress={() => handleRestaurar(item)}
                            className="p-3 bg-blue-50 rounded-2xl mr-2 active:bg-blue-100"
                        >
                            <Feather name='rotate-ccw' size={20} color="#3b82f6" />
                        </TouchableOpacity>

                        {/* Botão Excluir */}
                        <TouchableOpacity
                            onPress={() => openDeleteDialog(item)}
                            className="p-3 bg-red-50 rounded-2xl active:bg-red-100"
                        >
                            <Feather name='trash-2' size={20} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                </View>
        </Pressable>
    );

    return (
       
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
             <StatusBar edges={['top']} className="bg-white" />
            {/* Header Manual */}
            <View className="bg-white p-4 py-4 flex-row items-center border-b border-gray-100 shadow-sm">
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    className="bg-gray-50 p-2 rounded-full">
                    <Feather name='arrow-left' size={22} color="#1f2937" />
                </TouchableOpacity>
                <View className="ml-3">
                    <Text className="text-xl font-bold text-gray-800">Registro de Atividades</Text>
                    {completedTasks.length > 0 && (
                        <Text className="text-xs text-gray-500">
                            {completedTasks.length} {completedTasks.length === 1 ? 'tarefa finalizada' : 'tarefas finalizadas'}
                        </Text>
                    )}
                </View>
            </View>

            <View className="flex-1">
                {loading ? (
                    <View className="flex-1 justify-center">
                        <ActivityIndicator size="large" color="#16a34a" />
                    </View>
                ) : (
                    <FlatList 
                        data={completedTasks}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
                        ListEmptyComponent={
                            // Container estilizado para a lista vazia
                            <View className="items-center justify-center mt-20 px-10">
                                <View className="bg-green-50 p-8 rounded-full mb-4">
                                    <Feather name='archive' size={80} color="#16a34a" />
                                </View>
                                <Text className="text-xl font-bold text-gray-800 text-center">Tudo limpo por aqui!</Text>
                                <Text className="text-gray-500 text-center mt-2">Você ainda não possui nenhuma tarefa concluída. Que tal finalizar algo hoje?</Text>
                            </View>
                        }
                    />
                )}
            </View>
           
                {/* Modal de Confirmação de Exclusão */}
                <Modal
                    visible={isDeleteModalVisible}
                    transparent={true}
                    animationType="fade"
                >
                    <View className="flex-1 justify-end bg-black/40">
                        <View className="bg-white rounded-t-[40px] p-8 items-center"
                            style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }}>
                            <View className="w-12 h-1.5 bg-gray-200 rounded-full mb-6"/>
                            <View className="bg-red-100 p-4 rounded-full mb-4">
                                <Feather name="alert-triangle" size={30} color="#ef4444" />
                            </View>

                            <Text className="text-xl font-bold text-gray-800 mb-2">Tem certeza?</Text>
                            <Text className="text-gray-500 text-center mb-8">
                                A tarefa "<Text className="font-bold text-gray-700">{selectedTask?.titulo}</Text>" será removida permanentemente.
                            </Text>

                            <View className="flex-row w-full space-x-3 mt-4">
                                <TouchableOpacity 
                                    activeOpacity={0.7}
                                    onPress={() => setIsDeleteModalVisible(false)}
                                    className="flex-1 bg-gray-100 p-4 rounded-2xl flex-row items-center justify-center"
                                >
                                    <Text className="text-gray-600 font-bold text-base">
                                        Cancelar
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                activeOpacity={0.8}
                                    onPress={() => {
                                        // Sua lógica de excluir aqui
                                        deletarTarefaApi(selectedTask?.id);
                                    }}
                                    className="flex-1 bg-red-500 p-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-red-300"
                                >
                                    <Feather name='trash-2' size={18} color="white" />
                                    <Text className="text-white font-bold ml-2 text-base">
                                         Excluir
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View> 
                    </View>
                </Modal>
        </SafeAreaView>
    );
}