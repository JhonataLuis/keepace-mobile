import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Modal, Alert } from 'react-native';
import { SafeAreaView  } from 'react-native-safe-area-context';
import { Feather} from '@expo/vector-icons';
import api from '../services/api';
import Toast from 'react-native-toast-message';
//import { userAuth } from '../services/AuthContext';

export default function TarefasConcluidas({ navigation }) {

    //const [user] = userAuth();
    const [completedTasks, setCompletedTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [menuVisible, setMenuVisible] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null); // Tarefa clicada
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    // Abre o dropdown com a opção de excluir
    const openMenu = (item) => {
        setSelectedTask(item);
        //setMenuVisible(true);

            Alert.alert(
            "Excluir Tarefa?",
             item.titulo,
            [
                { text: "Excluir", onPress: () => setIsDeleteModalVisible(true), // Abre seu modal bonitão de confirmação
                    style: "destructive", color: "#ef4444" // No iOS fica vermelho automaticamente
                },
                { text: "Cancelar", style: "cancel" }
            ],
            { cancelable: true }
        );
    };

    // Dispara o processo de exclusão
    const handleActionExcluir = () => {
        setMenuVisible(false); // Fecha o dropdown
        setTimeout(() => setIsDeleteModalVisible(true), 300); // Abre o modal de confirmação
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
                type: 'success',
                text1: 'Sucesso!',
                text2: 'A tarefa foi removida permanentemente.',
                visibilityTime: 3000, // Define quanto tempo o tast fica visível
                autoHide: true, // Define se o toast some sozinho
                topOffset: 50, // Define a distância do topo da tela
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

    const formatarData = (dataString) => {
        if (!dataString) return 'Data não informada | Sem registro';
        const data = new Date(dataString);
        return `${data.toLocaleDateString('pt-BR')} ás ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit'})}`;
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
        <View className="bg-white p-4 mb-3 rounded-xl border border-gray-100 shadow-sm">
            <View className={`absolute left-0 top-0 bottom-0 w-1.5 ${getCorPrioridade(item.prioridade)}`}/>
                {/* Botão de Opções */}
                <TouchableOpacity
                onPress={() => openMenu(item)} // Passa o item todo para o estado
                    className="absolute right-2 top-2 top-2 p-2 z-10"
                >
                    <Feather name='more-vertical' size={20} color="#4b5563" />
                </TouchableOpacity>
                <View className="flex-row items-center mb-2 pr-6">
                    <Feather name="check-circle" size={20} color="#16a34a" />
                    <Text className="ml-2 text-base font-bold text-gray-800 line-through">
                        {item.titulo}
                    </Text>
                </View>

            <View className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                 <View className="flex-row items-center">
                    <Feather name="clock" size={14} color="#6b7280" />
                    <Text className="ml-2 text-xs text-gray-500">
                        Concluído: <Text className="fong-semibold text-gray-700">{formatarData(item.updatedAt)}</Text>
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header Manual */}
            <View className="bg-white p-4 flex-row items-center border-b border-gray-100">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                    <Feather name='arrow-left' size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text className="text-lg font-bold ml-2 text-gray-800">Registro de Atividades</Text>
            </View>

            <View className="flex-1 p-4">
                {loading ? (
                    <ActivityIndicator size="large" color="#16a34a" className="mt-10" />
                ) : (
                    <FlatList 
                    data={completedTasks}
                     keyExtractor={(item) => item.id.toString()}
                     renderItem={renderItem}
                     ListEmptyComponent={
                        // Container estilizado para a lista vazia
                        <View className="items-center justify-center mt-20 px-10">
                            <View className="bg-green-50 p-6 rounded-full mb-4">
                                <Feather name='check-circle' size={80} color="#16a34a" />
                            </View>
                             <Text className="text-xl font-bold text-gray-800 text-center">Tudo limpo por aqui!</Text>
                             <Text className="text-gray-500 text-center mt-2">Você ainda não possui nenhuma tarefa concluída. Que tal finalizar algo hoje?</Text>
                        </View>
                       
                     }
                     contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
                    />
                )}
            </View>
           
            <View>
                {/* Modal de Confirmação de Exclusão */}
                <Modal
                    visible={isDeleteModalVisible}
                    transparent={true}
                    animationType="slide"
                >
                    <View className="flex-1 justify-end bg-black/50">
                        <View className="bg-white rounded-t-[40px] p-8 items-center">
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
            </View>
        </SafeAreaView>
    );
}