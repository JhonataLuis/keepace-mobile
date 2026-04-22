import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Pressable, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { isBefore, isToday, isTomorrow, startOfDay } from 'date-fns';
import { StatusBar } from 'expo-status-bar';

// IMPORTS ESSENCIAIS PARA DRAG & D
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DragList from 'react-native-draglist';

import api from '../services/api' // Instância do Axios
import { useAuth } from '../services/AuthContext';
import { Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { es } from 'date-fns/locale';

// Para formatar a data da entrega tarefa
const formatarDataExibicao = (dataString) => {
    if(!dataString) return '';

    try{
      const data = new Date(dataString);
      const hora = data.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });

      if (isToday(data)) {
        return `Hoje ${hora}`;
      }

      if (isTomorrow(data)) {
        return `Amanhã ${hora}`;
      }

      // Usando toLocaleString 
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        /*year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'*/
      }) + ` ${hora}`;
    } catch (e) {
        return 'Data inválida', e;
    }
};

export default function ListaTarefas({ navigation }) {
    const insets = useSafeAreaInsets(); // Pega as medidas das bordas (notch e botões do sistema)

    const [tasks, setTasks] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [animatingIds, setAnimatingIds] = useState([]);
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
      'BAIXA': { color: '#10B981', bg: '#D1FAE5', icon: 'arrow-down'}, // Branco/Cinza claro
      'MEDIA': {color: '#F59E0B', bg: '#FEF3C7', icon: 'minus' }, // Azul
      'ALTA': { color: '#F97316', bg: '#FFEDD5', icon: 'arrow-up'}, // Laranja
      'URGENTE': { color: '#EF4444', bg: '#FEE2E2', icon: 'alert-circle'}, // Vermelho
    };

    // Tags para categorias
    const categorias = [
        {label: 'Pessoal', value: 'PESSOAL', color: '#3B82F6', bg: '#DBEAFE',},
        {label: 'Trabalho', value: 'TRABALHO', color: '#10B981', bg: '#EDE9FE',},
        {label: 'Estudos', value: 'ESTUDOS', color: '#8B5CF6', bg: '#EDE9FE',},
    ];

    // Função para mostrar cor da categoria
    const getCategoriaConfig = (categoriaValue) => {
        return categorias.find(cat => cat.value === categoriaValue);
    };

    // Função para mostrar badge da tarefa recorrente
    const getRecorrenciaConfig = (recorrencia) => {
    const opcoes = [
        { value: 'DIARIA', icon: 'sun', color: '#3b82f6', bg: '#DBEAFE', label: ' Diária' },
        { value: 'SEMANAL', icon: 'calendar', color: '#8b5cf6', bg: '#EDE9FE', label: ' Semanal' },
        { value: 'MENSAL', icon: 'refresh-cw', color: '#f97316', bg: '#FFEDD5', label: ' Mensal' },
    ];

    return opcoes.find(o => o.value === recorrencia);
};

    // Função para informar com cores sobre a data de entrega da tarefa, atrasado, hoje, amanhã
    const obterEstiloPrazo = (dataString) => {
        if (!dataString) return { container: 'bg-gray-100', text: 'text-gray-500', icone: 'calendar', label: '' };

        const dataEntrega = new Date(dataString);
        const agora = new Date();

        // Se o horário atual já passou da data de entrega (Independente de ser hoje ou não) ATRASADA
        if(isBefore(dataEntrega, agora)){
            return { container: 'bg-red-100', text: 'text-red-600', icone: 'alert-circle', label: 'Atrasada ' };
        }

        // Se for hoje
        if (isToday(dataEntrega)) {
            return { container: 'bg-green-100', text: 'text-green-600', icone: 'clock' }; // Tem lógica acima para Hoje
        }

        // Se for amanhã
        if (isTomorrow(dataEntrega)) {
            return { container: 'bg-blue-100', text: 'text-blue-600', icone: 'calendar' }; // Tem lócia acima para Amanhã
        }

        // Futuro distante
        return { container: 'bg-purple-100', text: 'text-purple-500', icone: 'calendar', label: ' ' };
    };

    // Função para atualizar ordem quando arrastar a tarefa
    const atualizarOrdem = async (novaLista) => {
        try {
            // Monta payload pro backend
            const payload = novaLista.map((item, index) => ({
                tarefaId: item.id,
                posicao: index
            }));

            await api.patch("/tasks/tarefas/reordenar", payload);

            Toast.show({
                type: 'success',
                text1: 'Ordem alterada.',
                visibilityTime: 3000,
                autoHide: true,
                topOffset: 300,
            });
        } catch (error) {
            console.log("Erro ao salvar ordem", error);
        }
    };

    // Função para recarregar dados quando usuário arrastar o dedo na tela para baixo
    const onRefresh = async () => {
        setRefreshing(true);
        await carregarTasks(true); // O carregarTasks(true) já reseta a lista e a página
        setRefreshing(false);
    };

    const carregarTasks = async (isFirstLoad = false) => {
        if (loading) return;
    
        try {
            setLoading(true);
            const currentPage = isFirstLoad ? 0 : page;

            const response = await api.get(`/tasks/tarefas/paginadas?page=${currentPage}&size=25&concluido=false`);
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

    // Função para des-concluir tarefa
    const desfazerConclusao = async (task) => {
        console.log("Tentando desfazer a tarefa ID:", task.id); // Log debug
        try {
            // Chama o backend para des-concluir tarefa
            // Endpoint aceite PATCH para restaurar a tarefa concluída
            await api.patch(`/tasks/tarefas/${task.id}/restaurar`);

            // Adiciona de volta a lista local
            setTasks(prevTask => {
                // Verifica se a tarefa já não está lá (evita duplicados)
                const existe = prevTask.some(t => t.id === task.id);
                if(existe) return prevTask;

                // Adiciona a tarefa de volta ao topo da lista
                return [task, ...prevTask];
            });

            Toast.hide(); // Esconde o tast após desfazer
        } catch (error) {
            console.log("Erro ao desfazer", error);
        }
    };

    const toggleComplete = async (task) => {
        try {
            // Inverte o status e envia para o backend via PUT ou PATCH
            const restaurarTask = { ...task, concluido: false };

            // Marca como animado
            setAnimatingIds(prev => [...prev, task.id]);

            // Chama backend
            await api.patch(`/tasks/tarefas/${task.id}/concluir`);
            console.log("Editando tarefa : ");

            // Atualização Local da lista de tarefas (Optimistic Update)
            // Remove a tarefa da lista de pendentes (já que ela está concluida)
            // Espera a animação terminar
            setTimeout(() => {
                setTasks(prev => prev.filter(t => t.id !== task.id));
                setAnimatingIds(prev => prev.filter(id => id !== task.id));
            }, 300);

           
            Toast.show({
                type: 'undoAction', // Tipo customizado
                text1: 'Tarefa Concluída!',
                position: 'top',
                topOffset: 300,
                visibilityTime: 4000,
                props: {
                    onUndo: () => desfazerConclusao(restaurarTask)
                }
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

    const renderTask = ({ item, onDragStart, isActive }) => {

        const chavePrioridade = item.prioridade?.toUpperCase() || 'BAIXA';
        // Fallback para 'BAIXA' se o valor for nulo ou diferente
        const estiloPrioridade = prioridadeCores[chavePrioridade] || prioridadeCores['BAIXA'];

        // Para badge de tarefas recorrente
        const recorrenciaConfig = getRecorrenciaConfig(item.recorrencia);
        
        // Declaração para cores da categoria
        const categoriaConfig = getCategoriaConfig(item.categoria);

        // Animação para checked
        const isAnimating = animatingIds.includes(item.id);

        const fadeAnim = new Animated.Value(1);
        const translateX = new Animated.Value(0);
        const scale = new Animated.Value(1);

        if (isAnimating) {
            Animated.parallel([
                // Fade out
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                // Slide pra direita
                Animated.timing(translateX, {
                    toValue: 120,
                    duration: 300,
                    useNativeDriver: true,
                }),

                    // Bounce + shrink
                    Animated.sequence([
                        Animated.spring(scale, {
                            toValue: 1.05,
                            useNativeDriver: true,
                        }),
                    Animated.timing(scale, {
                        toValue: 0.9,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                ])
            ]).start();
        }
        

        return (
          
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [
                    { translateX },
                    { scale }
                ],
            }}
        >
              <StatusBar edges={['top']} className="bg-white" />
                {/* Container principal em um botão de ação editar */}
                <Pressable 
                    onPressIn={() => console.log("Toucou na tarefa:", item.id)}
                    onLongPress={() => {
                        console.log("Long press detectado:", item.id);
                        onDragStart && onDragStart();
                    }} // Segura para arrastar
                        delayLongPress={200}
                        disabled={isActive}
                        activeOpacity={0.8}
                        onPress={() => {
                        // Só navega se não estiver arrastando e se a tarefa não estiver nula
                        if (!isActive && item.id){
                            navigation.navigate('CriarEditarTarefa', { task: item });
                        }
                    }}
                        
                    style={({ pressed }) => [
                        {
                            opacity: isActive ? 0.9 : 1,
                            // Borda lateral
                            borderLeftColor: item.concluido ?  '#e5e7eb' : estiloPrioridade.color,
                            borderLeftWidth: 5,
                            // Fundo
                            backgroundColor: pressed ? estiloPrioridade.bg : item.concluido ? '#f9fafb' : '#ffffff', // Leve transparencia no card |  Efeito: cinza claro ao clicar
                            // Scale (efeito toque)
                            transform: [{ scale: pressed ? 0.97 : 1 }], // Efeito: encolhe levemente ao clicar
                            // ANDROID (Simula glow)
                            elevation: pressed ? 8 : 2,
                            shadowOpacity: pressed ? 0.18 : 0.05,
                            shadowRadius: pressed ? 8 : 3,
                            shadowColor: item.concluido ? '#000' : estiloPrioridade.color,
                        },
                        // Classes Tailwind aqui(exceto a cor de fundo que é dinamica)
                        { borderRadius: 14, paddingVertical: 12, paddingHorizontal: 10, marginBottom: 12 }
                    ]}
                    // Efeito de onda (Ripple) exclusivo para Android
                    android_ripple={{ color: '#e5e7eb' }}
                >
                <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                        <View className="flex-row items-center -ml-1">
                            {/* Botão checkbox para concluir (Clique no texto ou ícone) */}
                            <Pressable 
                                onPress={() => toggleComplete(item)}
                                hitSlop={{ top: 10 }} // Aumenta a área do toque
                                className="mr-3"
                                >
                                    {/* Ícone de Checkbox com cor dinâmico  */}
                                    <Feather name={item.concluido ? "check-circle" : "circle"}
                                        size={22}
                                        color={item.concluido ? "#9ca3af" : estiloPrioridade.color}
                                    />
                            </Pressable>
                                <Text 
                                    numberOfLines={1}
                                    className={`text-base font-medium flex-1 ${item.concluido ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                    {item.titulo}
                                </Text>
                        </View>
                        {item.descricao && (
                            <Text 
                                numberOfLines={1} // Limita a 3 linhas
                                ellipsizeMode='tail' // Adiciona o "..." no final
                                className={`text-sm mt-1 ml-8 ${item.concluido ? 'text-gray-500' : 'text-gray-600'}`}>
                                {item.descricao}
                            </Text>
                        )}

                        {/* Badge de Categoria/Prioridade */}
                        {!item.concluido && (
                            <View 
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginTop: 8,
                                    marginLeft: 24,
                                    flexWrap: 'nowrap', // Nunca quebra linha
                                }}
                            >
                                {item.categoria && categoriaConfig && (
                                    <Text 
                                        style={{
                                            fontSize: 10,
                                            backgroundColor: categoriaConfig.bg,
                                            color: categoriaConfig.color,
                                            paddingHorizontal: 6,
                                            paddingVertical: 3,
                                            borderRadius: 6,
                                            marginRight: 6,
                                            maxWidth: 80, // limita
                                            fontWeight: '600'
                                        }}
                                    >
                                        {item.categoria}
                                    </Text>
                                )}
                                {/* Prioridade com cor de texto dinâmica */}
                                <View 
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor: estiloPrioridade.bg,
                                        paddingHorizontal: 6,
                                        paddingVertical: 3,
                                        borderRadius: 6, 
                                        marginRight: 6,
                                    }}
                                >
                                    <Feather 
                                        name={estiloPrioridade.icon}
                                        size={11}
                                        color={estiloPrioridade.color}
                                        style={{ marginRight: 3 }}
                                    />
                                    <Text
                                        style={{
                                            fontSize: 10, // Legível
                                            fontWeight: '600',
                                            color: estiloPrioridade.color,
                                        }}
                                    >
                                        {chavePrioridade === 'MEDIA' ? 'MÉDIA' : chavePrioridade}
                                    </Text>
                                </View>
                                {/* DueDate (Prioridade Alta) */}
                                {item.dueDate && (
                                <View 
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        maxWidth: '45%',
                                        flexShrink: 1,
                                        paddingHorizontal: 6,
                                        paddingVertical: 3,
                                        borderRadius: 6, 
                                        overflow: 'hidden',
                                        //marginRight: 6,
                                    }}
                                    className={` ${obterEstiloPrazo(item.dueDate).container}`}>
                                    <Feather 
                                        name={obterEstiloPrazo(item.dueDate).icone}
                                        size={11}
                                        color={obterEstiloPrazo(item.dueDate).text === 'text-red-600' ? '#dc2626' : 
                                            obterEstiloPrazo(item.dueDate).text === 'text-orange-600' ? '#ea580c' : '#6b7280'}
                                        style={{ marginRight: 4 }}
                                    />
                                    <Text 
                                        numberOfLines={1}
                                        ellipsizeMode='tail'
                                        style={{
                                            fontSize: 10,
                                            fontWeight: '500',
                                            flexShrink: 1
                                        }}
                                        className={`${obterEstiloPrazo(item.dueDate).text}`}>
                                            {obterEstiloPrazo(item.dueDate).label && `${obterEstiloPrazo(item.dueDate).label}`}
                                            {formatarDataExibicao(item.dueDate)}
                                    </Text>
                                </View>
                                )}

                                {/* Badge para tarefas recorrentes */}
                                {recorrenciaConfig && (
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            backgroundColor: recorrenciaConfig.bg,
                                            paddingHorizontal: 6,
                                            paddingVertical: 3,
                                            borderRadius: 6,
                                            marginLeft: 3,
                                        }}
                                    >
                                        <Feather
                                            name={recorrenciaConfig.icon}
                                            size={11}
                                            color={recorrenciaConfig.color}
                                            //style={{ marginRight: 3}}
                                        />
                                        <Text style={{ 
                                            fontSize: 10, 
                                            color: recorrenciaConfig.color 
                                        }}
                                            numberOfLines={1}
                                            >
                                            {recorrenciaConfig.label}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </Pressable>
        </Animated.View>
      
        );
};

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
        {/*SafeAreaView no topo garante que o Header não fique embaixo da câmera/relogio*/}
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 bg-gray-100">
            {/* Header fixo */}
            <View className="bg-white pt-12 pb-4 px-6 flex-row justify-between items-center shadow-sm z-50">
                    <Text className="text-xl font-bold text-gray-800">Minhas Tarefas</Text>
                <View className="flex-row">

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
                    <View className="items-center justify-center mt-20 px-10">
                        <View className="bg-blue-50 p-8 rounded-full mb-6">
                            <Feather name='clipboard' size={70} color="#3b82f6" />
                        </View>
                        <Text className="text-xl font-bold text-gray-800 text-center">
                            Sua lista está vazia
                        </Text>
                        <Text className="text-gray-500 text-center mt-2">
                            Organize seu dia agora mesmo.{'\n'}
                            Toque no botão <Text className="font-bold text-blue-500"> + </Text>
                        </Text>
                    </View>
                ) : (
                    <DragList
                        data={tasks}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item, onDragStart, isActive }) =>
                            renderTask({ item, onDragStart, isActive })
                        }
                            onDragBegin={() => console.log("COMEÇOU DRAG")}
                            onReordered={( fromIndex, toIndex ) => {
                                console.log("Terminou Drag", { fromIndex, toIndex });
                                const updated = [...tasks];
                                const movedItem = updated.splice(fromIndex, 1)[0];
                                updated.splice(toIndex, 0, movedItem);

                                // Atualiza UI imediatamente (UX rápida)
                                setTasks(updated);

                                // Salva no backend
                                atualizarOrdem(updated);

                            }}
                            activationDistance={10}
                            
                        //keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                        contentContainerStyle={{ paddingTop: 16, paddingBottom: 150 }}

                        // Para atualizar pagina e recarregar os dados quando arrastar o dedo na tela mobile
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        
                        // SÓ CHAMA SE: não estiver carregando E se tiver mais dados
                        onEndReached={() => {
                            if (!loading && hasMore) {
                                console.log("Chegou ao fim, carregando mais...");
                                carregarTasks(false);
                            }
                        }}
                        onEndReachedThreshold={0.1} // 0.1 é mais seguro que 0.5 para evitar loops
                        ListFooterComponent={() => (
                            loading && !refreshing ? ( // adicionado !refreshing para não mostrar dois loaders
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
        </GestureHandlerRootView>
    );
}

