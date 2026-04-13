import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
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

    // Abre o dropdown
    const openMenu = (item) => {
        setSelectedTask(item);
        setMenuVisible(true);
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
        <SafeAreaView className="flex-1 bg-gray-100">
            {/* Header Manual */}
            <View className="bg-white p-4 flex-row items-center border-b border-gray-200">
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

            {/* Dropdown de Opções */}
            <Modal
                visible={menuVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <TouchableOpacity 
                    className="flex-1 bg-black/10" 
                    activeOpacity={1} 
                    onPress={() => setMenuVisible(false)}
                >
                    {/* Ajuste o posicionamento conforme sua necessidade ou use coordenadas */}
                    <View className="absolute right-10 top-20 bg-white rounded-2xl shadow-xl border border-gray-100 w-48 overflow-hidden">
                        <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-50 active:bg-gray-100">
                            <Feather name="edit-2" size={16} color="#4b5563" />
                            <Text className="ml-3 text-gray-700">Editar</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-50 active:bg-gray-100">
                            <Feather name="share-2" size={16} color="#4b5563" />
                            <Text className="ml-3 text-gray-700">Compartilhar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-50 active:bg-gray-100">
                            <Feather name="copy" size={16} color="#4b5563" />
                            <Text className="ml-3 text-gray-700">Duplicar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-50 active:bg-gray-100">
                            <Feather name="archive" size={16} color="#4b5563" />
                            <Text className="ml-3 text-gray-700">Arquivar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            onPress={handleActionExcluir}
                            className="flex-row items-center p-4 active:bg-red-50"
                        >
                            <Feather name="trash-2" size={16} color="#ef4444" />
                            <Text className="ml-3 text-red-500 font-semibold">Excluir tarefa</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
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

                            <View className="flex-row w-full space-x-3">
                                <TouchableOpacity 
                                    onPress={() => setIsDeleteModalVisible(false)}
                                    className="flex-1 bg-gray-100 p-4 rounded-2xl items-center"
                                >
                                    <Text className="text-gray-600 font-bold">Cancelar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    onPress={() => {
                                        // Sua lógica de excluir aqui
                                        deletarTarefaApi(selectedTask?.id);
                                    }}
                                    className="flex-1 bg-red-500 p-4 rounded-2xl items-center shadow-lg shadow-red-200"
                                >
                                    <Text className="text-white font-bold">Excluir</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
}