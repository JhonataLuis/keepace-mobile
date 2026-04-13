import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../services/api' // Instância do Axios
import { useAuth } from '../services/AuthContext';
import { Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

export default function ListaTarefas({ navigation }) {
    const insets = useSafeAreaInsets(); // Pega as medidas das bordas (notch e botões do sistema)

    const [tasks, setTasks] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        // Carrega a primeira vez que o componente monta
        carregarTasks(true);
        const unsubscribe = navigation.addListener('focus', () => {
            // Ao ganhar foco, força o carregamento da primeira página
            carregarTasks(true);
        });
        return unsubscribe;
    }, [navigation]);

    // Ação para mudar as cores do card da tarefa conforme a prioridade
    const prioridadeCores = {
      'BAIXA': { border: 'border-white', text: '#374151', check: '#d1d5db' }, // Branco/Cinza claro
      'MEDIA': { border: 'border-blue-500', text: '#3b82f6', check: '#3b82f6' }, // Azul
      'ALTA': { border: 'border-orange-500', text: '#f97316', check: '#f97316'}, // Laranja
      'URGENTE': { border: 'border-red-600', text: '#dc2626', check: '#dc2626'}, // Vermelho
    };

    const carregarTasks = async (isFirstLoad = false) => {
        if (loading) return;
    
        try {
            setLoading(true);
            const currentPage = isFirstLoad ? 0 : page;

            const response = await api.get(`/tasks/tarefas/paginadas?page=${currentPage}&size=12&concluido=false`);
            console.log("CONTEÚDO DA API:", JSON.stringify(response.data.content, null, 2));
            
            const newTasks = response.data?.content || [];
            const isLast = response.data?.last ?? true;

            // Filtra para pegar apenas o que não está concluído da resposta da API
                const pendentes = newTasks.filter(task => task.concluido === false);

            setTasks(prev => {

                if (isFirstLoad) {
                    return pendentes; // Substitui a lista inteira
                }

                // FILTRO DE SEGURANÇA: Só adiciona se o ID não existir no array anterior (Filtra duplicados)
                const filteredNewTasks = pendentes.filter(
                    newTask => !prev.some(prevTask => prevTask.id === newTask.id)
                );
                return [...prev, ...filteredNewTasks];
            });

            setHasMore(!isLast);
            setPage(isFirstLoad ? 1 : currentPage + 1); // Atualiza para a próxima pagina
        } catch (error) {
            console.error('Erro ao carregar tarefas:', error);
        } finally {
            setLoading(false);
    }
};

    const toggleComplete = async (task) => {
        try {
            // Inverte o status e envia para o backend via PUT ou PATCH
            //const updatedTask = { ...task, concluido: !task.concluido };

            await api.patch(`/tasks/tarefas/${task.id}/concluir`);
            console.log("Editando tarefa : ");

            // Atualização Local da lista de tarefas (Optimistic Update)
            // Remove a tarefa da lista de pendentes (já que ela está concluida)
            setTasks(prev => prev.filter(t => t.id !== task.id));
            //carregarTasks(true); // Recarrega apenas a primeira pagina para atualizar o status da tela
            Toast.show({
                type: 'success',
                text1: 'Tarefa Concluída!',
                text2: 'Bom trabalho!.',
                visibilityTime: 3000, // Define quanto tempo o tast fica visível
                autoHide: true, // Define se o toast some sozinho
                topOffset: 50, // Define a distância do topo da tela
            }); 
        } catch (error) {
            console.error("Erro ao concluir tarefa.", error);
            Toast.show({
                type: 'error',
                text1: 'Erro!',
                text2: 'Não foi possível concluir a tarefa.',
                visibilityTime: 3000,
                autoHide: true,
                topOffset: 50,
            });
        }
    };

    const renderTask = ({ item }) => {

        const chavePrioridade = item.prioridade?.toUpperCase() || 'BAIXA';
        // Fallback para 'BAIXA' se o valor for nulo ou diferente
        const estiloPrioridade = prioridadeCores[chavePrioridade] || prioridadeCores['BAIXA'];
        

        return (
        <View 
            style={{ borderLeftColor: item.concluido ? '#d1d5db' : estiloPrioridade.check }}
            className="bg-white rounded-xl p-4 mb-3 shadow-sm border-l-4">
            <View className="flex-row justify-between items-start">
                <View className="flex-1 mr-3">
                    {/* Botão para concluir (Clique no texto ou ícone) */}
                    <TouchableOpacity 
                        onPress={() => toggleComplete(item)}
                        className="flex-row items-center"
                        >
                            {/* Ícone de Checkbox com cor dinâmico  */}
                            <Feather name={item.concluido ? "check-circle" : "circle"}
                                size={20}
                                color={item.concluido ? "#9ca3af" : estiloPrioridade.check}
                                className="mr-2"
                            />
                        <Text className={`text-lg font-semibold ${item.concluido ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                            {item.titulo}
                        </Text>
                    </TouchableOpacity>
                    {item.descricao && (
                        <Text 
                            numberOfLines={1} // Limita a 3 linhas
                            ellipsizeMode='tail' // Adiciona o "..." no final
                            className={`text-sm mt-1 ml-7 ${item.concluido ? 'text-gray-400' : 'text-gray-600'}`}>
                            {item.descricao}
                        </Text>
                    )}

                    {/* Badge de Categoria/Prioridade */}
                    {!item.concluido && (
                        <View className="flex-row mt-2 ml-7 items-center">
                            <Text className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded mr-2">
                                {item.categoria}
                            </Text>

                            {/* Prioridade com cor de texto dinâmica */}
                            <View className="flex-row items-center bg-gray-100 px-2 py-0.5 rounded mr-2">
                                <View 
                                    style={{ backgroundColor: estiloPrioridade.check }}
                                        className="w-2 h-2 rounded-full mr-1"
                                    />
                                 <Text 
                                    style={{ color: estiloPrioridade.text }}
                                    className="text-[10px] font-bold">
                                {chavePrioridade}
                            </Text>
                            </View>
                            <View className="bg-gray-100 px-2 py-0.5 rounded">
                                <Text className="text-[10px] text-blue-500">
                                    {item.dueDate}
                                </Text>
                            </View>
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
};

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
                                    {/*<TouchableOpacity 
                                        className="flex-row items-center p-4 border-b border-gray-50 active:bg-gray-50"
                                        onPress={() => {
                                            setMenuVisible(false);
                                            carregarTasks(true); // Exemplo de ação/ Implementar próxima feature
                                        }}
                                    >
                                        <Feather name="mail" size={16} color="#4b5563" />
                                        <Text className="ml-3 text-gray-700">Enviar por e-mail</Text>
                                    </TouchableOpacity>*/}

                                     {/*<TouchableOpacity 
                                        className="flex-row items-center p-4 border-b border-gray-50 active:bg-gray-50"
                                        onPress={() => {
                                            setMenuVisible(false);
                                            carregarTasks(true); // Exemplo de ação/ Implementar próxima feature
                                        }}
                                    >
                                        <Feather name="message-square" size={16} color="#4b5563" />
                                        <Text className="ml-3 text-gray-700">Comentários</Text>
                                    </TouchableOpacity>*/}

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
            <View className="flex-1 px-2 bg-gray-50">
                {tasks.length === 0 && !loading ? (
                    // View centralizada para estado vazio
                    <View className="flex-1 items-center justify-center pb-20">
                        <View className="bg-blue-50 p-8 rounded-full mb-6">
                            <Feather name='clipboard' size={70} color="#3b82f6" />
                        </View>
                        <Text className="text-2xl font-bold text-gray-800 mb-2">
                            Sua lista está vazia
                        </Text>
                        <Text>
                            Organize seu dia agora mesmo.{'\n'}
                            Toque no botão <Text className="font-bold text-blue-500"> + </Text>
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
                            loading ? (
                                <View className="py-4">
                                    <ActivityIndicator size="large" color="#16a34a" />    
                                </View>
                            ) : null
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
             className="absolute right-6 bg-green-600 w-14 h-14 rounded-2xl items-center justify-center shadow-lg z-50"
             onPress={() => navigation.navigate('CriarEditarTarefa')}
            >
                <Feather name="plus" size={24} color="white"/>
            </TouchableOpacity>

            {/* --- Footer Fixo com 4 Botões --- */}
            <View
                 style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 15, // Se não tiver barra (gestos), usa 15px
                    height: 70 + (insets.bottom > 0 ? insets.bottom : 0)
                 }}
                 className="absolute bottom-0 w-full bg-white flex-row justify-around items-center py-4 border-t border-gray-100 shadow-xl">
                <TouchableOpacity
                  className="items-center" 
                  onPress={() => navigation.navigate('Home')}>
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
                  className="items-center"
                  onPress={() => navigation.navigate('Perfil')}
                 >
                    <Feather name='user' size={24} color="#9ca3af" />
                    <Text className="text-[10px] text-gray-500">Perfil</Text>
                </TouchableOpacity>
                
                </View>
            </View>
        </SafeAreaView>
    );
}

