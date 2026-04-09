import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../services/api' // Instância do Axios
import { useAuth } from '../services/AuthContext';
import { Feather } from '@expo/vector-icons';

export default function ListaTarefas({ navigation }) {
    const insets = useSafeAreaInsets(); // Pega as medidas das bordas (notch e botões do sistema)

    const [tasks, setTasks] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
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
            // Filtra para pegar apenas o que não está concluído da resposta da API
            const pendentes = newTasks.filter(task => task.concluido === false);

            if (isFirstLoad) return pendentes;

            // FILTRO DE SEGURANÇA: Só adiciona se o ID não existir no array anterior (Filtra duplicados)
            const filteredNewTasks = pendentes.filter(
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
            const updatedTask = { ...task, concluido: !task.concluido };

            await api.put(`/tasks/tarefas/${task.id}/concluir`, updatedTask);
            console.log("Editando tarefa : ", updatedTask);

            // Remove a tarefa da lista localmente (já que ela está concluida)
            setTasks(prev => prev.filter(t => t.id !== task.id));
            //carregarTasks(true); // Recarrega apenas a primeira pagina para atualizar o status da tela
            Alert.alert('Sucesso', 'Tarefa concluída!');
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
                        <Text className={`text-lg font-semibold ${item.concluido ? 'line-through text-gray-400' : 'text-gray-800'}`}>
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
                             <Text className="text-[10px] bg-gray-100 text-cyan-500 px-2 py-0.5 rounded">
                                {item.prioridade}
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
        // SafeAreaView no topo garante que o Header não fique embaixo da câmera/relogio
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 bg-gray-100">
            {/* Header fixo */}
            <View className="bg-white pt-12 pb-4 px-6 flex-row justify-between items-center shadow-sm z-50">
                <Text className="text-xl font-bold text-gray-800">Minhas Tarefas</Text>
             <View className="flex-row">
                <TouchableOpacity className="p-2 mr-2 bg-gray-100 rounded-full">
                    <Feather name="list" size={20} color="#4b5563" />
                </TouchableOpacity>

                {/* Container do Menu */}
                <View>
                    <TouchableOpacity 
                        className="p-2 bg-gray-100 rounded-full"
                        onPress={() => setMenuVisible(!menuVisible)}
                        >
                        <Feather name="more-vertical" size={20} color="#4b5563" />
                    </TouchableOpacity>
                    {/* Dropdown Menu */}
                    {menuVisible && (
                        <>
                            {/* Backdrop: Fecha o menu se clicar fora dele */}
                            <TouchableOpacity
                             activeOpacity={1}
                             style={{ 
                                position: 'absolute',
                                top: -100,
                                right: -100,
                                width: 1000,
                                height:2000,
                                backgroundColor: 'transparent'
                             }}
                             onPress={() => setMenuVisible(false)}
                            />
                            {/* Caixa do Menu */}
                                <View 
                                 style={{ 
                                    elevation: 10,
                                    shadowColor: '#000', 
                                    shadowOpacity: 0.2, 
                                    shadowRadius: 10,
                                    position: 'absolute',
                                    right: -20,
                                    top: 45,
                                    width: 325,
                                    zIndex: 999
                                }}
                                 className="bg-white rounded-xl border border-gray-100 overflow-hidden"
                                >
                                    <TouchableOpacity 
                                        className="flex-row items-center p-4 border-b border-gray-50 active:bg-gray-50"
                                        onPress={() => {
                                            setMenuVisible(false);
                                            carregarTasks(true); // Exemplo de ação
                                        }}
                                    >
                                        <Feather name="mail" size={16} color="#4b5563" />
                                        <Text className="ml-3 text-gray-700">Enviar por e-mail</Text>
                                    </TouchableOpacity>

                                     <TouchableOpacity 
                                        className="flex-row items-center p-4 border-b border-gray-50 active:bg-gray-50"
                                        onPress={() => {
                                            setMenuVisible(false);
                                            carregarTasks(true); // Exemplo de ação
                                        }}
                                    >
                                        <Feather name="message-square" size={16} color="#4b5563" />
                                        <Text className="ml-3 text-gray-700">Comentários</Text>
                                    </TouchableOpacity>

                                        <TouchableOpacity 
                                            className="flex-row items-center p-4 active:bg-gray-50"
                                            onPress={() => {
                                                setMenuVisible(false);
                                                navigation.navigate('TarefasConcluidas');
                                            }}
                                        >
                                            <Feather name="check-square" size={16} color="#4b5563" />
                                            <Text className="ml-3 text-gray-700">Registro de Atividades</Text>
                                        </TouchableOpacity>
                                </View>
                        </>
                    )}
                </View>

            </View>
            
            </View>
            {/* --- Conteúdo da Lista --- */}
            <View className="flex-1 p-4">
                {tasks.length === 0  ? (
                    <View className="items-center justify-center py-10">
                        <Text className="text-gray-500 text-center text-base">
                            Nenhuma tarefa ainda.{'\n'}
                            Clique no "+" para começar!
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={tasks}
                        renderItem={renderTask}
                        keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                        contentContainerStyle={{ paddingTop: 16, paddingBottom: 150 }}
                        
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
            {/* -- Botão "+" (FAB) Flutuante -- */}
            <TouchableOpacity
             style={{ elevation: 8,
                // Sombra para iOS
                shadowColor:"#000",
                shadowOffset: {
                    width: 0,
                    height: 4,
                },
                shadowOpacity: 0.30,
                shadowRadius: 4.65,
                // Posicionamento dinâmico
                bottom: 80 + insets.bottom // Sobe botão conforme a barra do android
              }} // Sombra no Android
             className="absolute right-6 bg-green-600 w-16 h-16 rounded-full items-center justify-center shadow-lg z-50"
             onPress={() => navigation.navigate('CriarEditarTarefa')}
            >
                <Feather name="plus" size={32} color="white"/>
            </TouchableOpacity>

            {/* --- Footer Fixo com 4 Botões --- */}
            <View
                 style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 15, // Se não tiver barra (gestos), usa 15px
                    height: 70 + (insets.bottom > 0 ? insets.bottom : 0)
                 }}
                 className="absolute bottom-0 w-full bg-white flex-row justify-around items-center py-4 border-t border-gray-200 shadow-xl">
                <TouchableOpacity
                 className="items-center" onPress={() => navigation.navigate('Home')}>
                    <Feather name="home" size={24} color="#9ca3af" />
                    <Text className="text-[10px] text-gray-500">Inicio</Text>
                </TouchableOpacity>

                <TouchableOpacity className="items-center">
                    <Feather name="list" size={24} color="#16a34a"/>
                    <Text className="text-[10px] text-green-600">Tarefas</Text>
                </TouchableOpacity>

                <TouchableOpacity className="items-center">
                    <Feather name='calendar' size={24} color="#9ca3af" />
                    <Text className="text-[10px] text-gray-500">Agenda</Text>
                </TouchableOpacity>

                <TouchableOpacity
                 className="items-center">
                    <Feather name='user' size={24} color="#9ca3af" />
                    <Text className="text-[10px] text-gray-500">Perfil</Text>
                </TouchableOpacity>
                
            </View>
        </View>
        </SafeAreaView>
    );
}

