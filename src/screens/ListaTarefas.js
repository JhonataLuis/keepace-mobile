import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api' // Instância do Axios
import { useAuth } from '../services/AuthContext';
import { Feather } from '@expo/vector-icons';

export default function ListaTarefas({ navigation }) {
    
    const [tasks, setTasks] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        carregarTasks();
        const unsubscribe = navigation.addListener('focus', carregarTasks);
        return unsubscribe;
    }, [navigation]);

    const carregarTasks = async (isFirstLoad = false) => {
    if (loading) return;
    
    try {
        setLoading(true);
        const currentPage = isFirstLoad ? 0 : page;

        const response = await api.get(`/tasks/tarefas/paginadas?page=${currentPage}&size=12`);
        console.log("CONTEÚDO DA API:", JSON.stringify(response.data.content, null, 2));
        const newTasks = response.data?.content || [];
        const isLast = response.data?.last ?? true;

        setTasks(prev => {
            if (isFirstLoad) return newTasks;

            // FILTRO DE SEGURANÇA: Só adiciona se o ID não existir no array anterior
            const filteredNewTasks = newTasks.filter(
                newTask => !prev.some(prevTask => prevTask.id === newTask.id)
            );
            return [...prev, ...filteredNewTasks];
        });

        setHasMore(!isLast);
        setPage(isFirstLoad ? 1 : currentPage + 1);
    } catch (error) {
        console.error('Erro:', error);
    } finally {
        setLoading(false);
    }
};

    const toggleComplete = async (task) => {
        try {
            // Inverte o status e envia para o backend via PUT ou PATCH
            const updatedTask = { ...task, completed: !task.completed };
            await api.put(`/tasks/tarefas/${task.id}/concluir`, updatedTask);
            carregarTasks(true); // Recarrega apenas a primeira pagina para atualizar o status da tela
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível atualizar a tarefa.');
        }
    };

    const renderTask = ({ item }) => (
        <View className={`bg-white rounded-xl p-4 mb-3 shadow-sm border-l-4 ${item.concluido ? 'border-gry-300' : 'border-green-500'}`}>
            <View className="flex-row justify-between items-start">
                <View className="flex-1 mr-3">
                    {/* Botão para concluir (Clique no texto ou ícone) */}
                    <TouchableOpacity 
                        onPress={() => toggleComplete(item)}
                        className="flex-row items-center"
                        >
                            {/* Ícone de Checkbox dinâmico  */}
                            <Feather name={item.concluido ? "check-circle" : "circle"}
                            size={20}
                            color={item.concluido ? "#9ca3af" : "#16a34a"}
                            className="mr-2"
                            />
                        <Text className={`text-lg fong-semibold ${item.concluido ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                            {item.titulo}
                        </Text>
                    </TouchableOpacity>
                    {item.descricao ? (
                        <Text 
                         numberOfLines={2} // Limita a 3 linhas
                         ellipsizeMode='tail' // Adiciona o "..." no final
                         className={`text-sm mt-1 ml-7 ${item.concluido ? 'text-gray-400' : 'text-gray-600'}`}>
                            {item.descricao}
                        </Text>
                    ) : null}
                    {/* Badge de Categoria/Prioridade */}
                    {!item.concluido && (
                        <View className="flex-row mt-2 ml-7">
                            <Text className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                                {item.categoria}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Botão editar */}
                <View className="flex-row items-center">
                    <TouchableOpacity
                     onPress={() => navigation.navigate('CriarEditarTarefa', { task: item })}
                     className="p-2 bg-blue-500 rounded-lg"
                    >
                        <Feather name="edit-2" size={18} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-100">
            <View className="p-4">
                <TouchableOpacity className="bg-green-600 rounded-xl p-4 mb-4"
                 onPress={() => navigation.navigate('CriarEditarTarefa')}
                >
                    <Text className="text-white text-center text-lg font-semibold">
                        <Feather name="plus" size={25} color="white"/>
                    </Text>
                </TouchableOpacity>

                {tasks.length === 0 ? (
                    <View className="items-center justify-center py-10">
                        <Text className="text-gray-500 text-center text-base">
                            Nenhuma tarefa ainda.{'\n'}
                            Clique em "Nova Tarefa" para começar!
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={tasks}
                        renderItem={renderTask}
                        keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                        // SÓ CHAMA SE: não estiver carregando E se tiver mais dados
                        onEndReached={() => {
                            if (!loading && hasMore) {
                                console.log("Chegou ao fim, carregando mais...");
                                carregarTasks(false);
                            }
                        }}
                        onEndReachedThreshold={0.1} // 0.1 é mais seguro que 0.5 para evitar loops
                        ListFooterComponent={() => (
                            loading ? <ActivityIndicator size="large" color="#16a34a" /> : null
                        )}
                    />
                )}
            </View>
        </View>
    );
}

