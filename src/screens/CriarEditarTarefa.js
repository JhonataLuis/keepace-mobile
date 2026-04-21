import React, { useEffect, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useAuth } from '../services/AuthContext';
import api from '../services/api'; // Instância do Axios
import Toast from 'react-native-toast-message'; // mensagens estilizadas mais profissional
import DateTimePicker from '@react-native-community/datetimepicker'; 


export default function CriarEditarTarefa({ navigation, route }) {

    
    const existingTask = route.params?.task;
    // Converte a string do banco para um objeto Date real se existir
    const initialDate = existingTask?.dueDate ? new Date(existingTask.dueDate) : null;

    const { user } = useAuth();
    const [titulo, setTitulo] = useState(existingTask?.titulo || '');
    const [descricao, setDescricao] = useState(existingTask?.descricao || '');
    const [categoria, setCategoria] = useState(existingTask?.categoria || '');
    const [prioridade, setPrioridade] = useState(existingTask?.prioridade || '');
    const [status, setStatus] = useState(existingTask?.status || 'TODO'); // Inicia com o STATUS A FAZER
    const [updatedAt, setUpdatedAt] = useState(existingTask?.updatedAt || new Date().toISOString());
    const [date, setDate] = useState(initialDate); // para dueDate
    const [showPicker, setShowPicker] = useState(false); // para dueDate
    const [mode, setMode] = useState('date'); // 'date' ou 'time' ? para dueDate
    const [loading, setLoading] = useState(false);
    const [currentTaskId, setCurrentTaskId] = useState(route.params?.task?.id || null);


    // Função para route pegar tarefa da notificação
    useEffect(() => { // Route para usuário clicar na notificação e abrir a tarefa
        let isMounted = true; // Controle para evitar atualizar estado se sair da tela
        
        //Função para buscar tarefa pelo id e user quando receber por notificação e clicar
        const buscarTask = async () => {
            const notifyId = route.params?.taskId;

            // Se não tem ID, não faz nada
            if (!notifyId) return;

                console.log("Buscando tarefa da notificação ID:", notifyId);

                 try {
                    setLoading(true);

                    // Chama a tarefa pelo ID
                    const response = await api.get(`/tasks/${notifyId}`);

                   if (isMounted && response.data){
                        // Preenche os campos com os dados que vieram com o banco
                        setTitulo(response.data.titulo);
                        setDescricao(response.data.descricao);
                        setCategoria(response.data.categoria || '');
                        setPrioridade(response.data.prioridade || '');
                        setStatus(response.data.status);
                        setCurrentTaskId(response.data.id); // Salva o ID para que o saveTask saiba que é uma edição
                        if (response.data.dueDate) {
                            setDate(new Date(response.data.dueDate));
                        }

                        // LIMPEZA: Limpa o taskId para evitar loops
                        navigation.setParams({ taskId: undefined });
                   }
                } catch (error) {
                    if (isMounted) {
                        console.error("Erro ao buscar tarefa:", error);
                        Toast.show({ type: 'error', text1: 'Erro ao carregar tarefa' });
                    }
                } finally {
                    if (isMounted) setLoading(false);
                }

        };

        buscarTask();

        return () => { isMounted = false; }; // Cleanup function

    }, [route.params?.taskId]);

    //
    const onChange = (event, selectedDate) => {
        // No Android, quando cancela, selectedDate vem undefined
        if(event.type === 'dismissed'){
            setShowPicker(false);
            return;
        }

        const currentDate = selectedDate || new Date(); // Fallback para hoje se vier vazio
        setDate(currentDate);

        // Se estiver no Android e acabou de selecionar a DATA,
        // você pode querer abrir automaticamente a HORA.
        if(Platform.OS === 'android'){
            setShowPicker(false); // Fecha o de data
            if(mode === 'date') {
                // Pequeno delay para não bugar o sistema de janelas do Android
                setTimeout(() => showMode('time'), 100);
            }
        } else {
             setShowPicker(Platform.OS === 'ios'); // No iOS o picker pode ficar aberto
        }

    };

    //
    const showMode = (currentMode) => {
        setShowPicker(true);
        setMode(currentMode);
    };

    // Função para salvar a tarefa
    const saveTask = async () => {
            setLoading(true);

        try {
            // Garantindo para LocalDateTime válido para o Spring Boot (Backend)
            const formattedDateTime = date ? format(date, "yyyy-MM-dd'T'HH:mm:ss") : null;

            // Verifica se status é concluído para inserir a dataConclusao
            const isDone = status === 'DONE';

            // Atualiza tarefas/ cria tarefas
            const taskData = {
                titulo: titulo.trim(),
                descricao: descricao.trim(),
                categoria: categoria || null, // se estiver vazio, envia null, caso contrário envia o valor
                prioridade: prioridade || null, // **
                status: status,
                dueDate: formattedDateTime, // Formato para LocalDateTime Spring Boot do Java / envia null se usuário não escolher data
                // Verifica se for DONE, envia data atual, senão null
                concluido: isDone,
                dataConclusao: isDone ? format(new Date(), "yyyy-MM-dd'T'HH:mm:ss") : null,
                updatedAt: updatedAt
               
            };

            if (currentTaskId) { // Verifica se temos um ID (seja da lista ou da busca)
                // Atualizar (PUT)
                await api.put(`/tasks/tarefas/${currentTaskId}`, taskData);
                    Toast.show({
                        type: 'success',
                        text1: 'Tarefa atualizada',
                        text2: 'As alterações foram salvas com sucesso',
                        visibilityTime: 3000,
                        autoHide: true,
                        topOffset: 300, // Evita ficar colado no notch
                    });
                console.log("Dados sendo atualizados:", JSON.stringify(taskData, null, 2));
            } else {
                // Criar novo (POST)
                await api.post('/tasks/tarefas', taskData);
                    Toast.show({
                        type: 'success',
                        text1: 'Tarefa criada',
                        text2: 'Sua tarefa foi salva com sucesso',
                        visibilityTime: 4000,
                        autoHide: true,
                        topOffset: 300,
                    });
                console.log("Dados sendo cadastrados:", JSON.stringify(taskData, null, 2));
            }
            navigation.goBack('ListaTarefas');
        } catch (error) {
            console.log('Erro detalhado ao salvar a tarefa:', error.response?.data); // Ajuda a ver o que o Java respondeu
            //const msg = error.response?.data?.message || 'Não foi possível salvar a tarefa';
            Toast.show({ type: 'error', text1: 'Não foi possível salvar a tarefa'});
            //Alert.alert('Erro', msg);
        } finally {
            setLoading(false);
        }
    };

    // Declaração para quando o titulo for maior que 0 / o usuário digitar 1 caracter no campo
    const isTituloValido = titulo.trim().length > 0;

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: 20 }}
                >
                    <View className="flex-1 bg-white justify-center">
                        <View className="bg-white rounded-3xl p-6 shadow-xl">
                            <Text className="text-2xl font-bold text-gray-800 mb-6 text-center">
                                {currentTaskId ? 'Editar Tarefa' : 'Nova Tarefa'}
                            </Text>
                            <Text className="text-gray-600 font-medium mb-2 ml-1">Titulo da Tarefa</Text>
                            <TextInput
                                className={`bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4 text-base ${isTituloValido ? 'border-gray-200' : 'border-red-300'}`}
                                placeholder='Ex: Ir no mercado sábado de manhã'
                                placeholderTextColor="#9ca3af"
                                value={titulo}
                                onChangeText={setTitulo}
                                maxLength={100}
                            />

                            <Text className="text-gray-600 font-medium mb-2 ml-1">
                                <Feather name='tag' size={20} />
                                    Categoria
                                </Text>
                            <View className="bg-gray-50 border border-gray-200 rounded-2xl mb-4 overflow-hidden">
                                <Picker
                                    selectedValue={categoria}
                                    onValueChange={(itemValue) => setCategoria(itemValue)}
                                >
                                    <Picker.Item label='Selecione...' value="" color='#9ca3af' />
                                    <Picker.Item label='Pessoal' value="PESSOAL" />
                                    <Picker.Item label='Trabalho' value="TRABALHO" />
                                    <Picker.Item label='Estudos' value="ESTUDOS" />
                                </Picker>
                            </View>

                            <Text className="text-gray-600 font-medium mb-2 ml-1">Status</Text>
                            <View className="bg-gray-50 border border-gray-200 rounded-2xl mb-4 overflow-hidden">
                                <Picker
                                    selectedValue={status}
                                    onValueChange={(itemValue) => setStatus(itemValue)}    
                                >
                                    <Picker.Item label='A Fazer' value="TODO" />
                                    <Picker.Item label='Em Andamento' value="DOING" />
                                    <Picker.Item label='Concluído' value="DONE" />
                                </Picker>
                            </View>
                            <Text className="text-gray-600 font-medium mb-2 ml-1">Descrição</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6 text-base text-gray-800"
                                placeholderTextColor="#9ca3af"
                                value={descricao}
                                onChangeText={setDescricao}
                                multiline
                                numberOfLines={4}
                                textAlignVertical='top'
                            />
                            <Text className="text-gray-600 font-medium mb-2 ml-1">Prioridade</Text>
                            <View className="bg-gray-50 border border-gray-200 rounded-2xl mb-4 overflow-hidden">
                                <Picker
                                selectedValue={prioridade}
                                onValueChange={(itemValue) => setPrioridade(itemValue)}
                                >
                                    <Picker.Item label='Selecione...' value="" color="#9ca3af" />
                                    <Picker.Item label='Baixa' value="Baixa"/>
                                    <Picker.Item label='Média' value="Media"/>
                                    <Picker.Item label='Alta' value="Alta"/>
                                    <Picker.Item label='Urgente' value="Urgente"/>
                                </Picker>
                            </View>
                           
                            <View className="mb-6">
                                <View className="flex-row justify-between items-center mb-2 ml-1">
                                    <Text className="text-gray-600 font-medium">Data</Text>
                                    {date && (
                                        <TouchableOpacity
                                            onPress={() => setDate(null)}>
                                            <Text className="text-red-400 text-xs font-bold">Remover prazo</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                 <View className="flex-row justify-between">
                                    {/* Botão Data */}
                                    <TouchableOpacity
                                        onPress={() => showMode('date')}
                                        className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl p-4 mr-2 flex-row items-center justify-between"
                                    >
                                        <Text className={date ? "text-gray-800" : "text-gray-400"}>
                                            {date ? format(date, 'dd/MM/yyyy') : 'Definir data'}
                                        </Text>
                                        <Feather name='calendar' size={18} color="#3b82f6" />
                                    </TouchableOpacity>

                                    {/* Botão Hora */}
                                    <TouchableOpacity
                                        onPress={() => showMode('time')}
                                        className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl p-4 flex-row items-center justify-between"
                                    >
                                        <Text className={date ? "text-gray-800" : "text-gray-400"}>
                                            {date ? format(date, 'HH:mm') : 'Definir hora'}
                                        </Text>
                                        <Feather name='clock' size={18} color="#3b82f6" />
                                    </TouchableOpacity>
                                 </View>

                                 {showPicker && (
                                    <DateTimePicker
                                        value={date || new Date()} // Se for null, abre no dia de hoje
                                        mode={mode}
                                        is24Hour={true}
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={onChange}
                                    />
                                 )}
                            </View>
                            
                            <TouchableOpacity
                                className={`rounded-2xl p-4 mb-3 shadow-md flex-row justify-center items-center ${isTituloValido ? 'bg-blue-600' : 'bg-gray-300'}`}
                                onPress={saveTask}
                                disabled={!isTituloValido || loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Text className="text-white text-center text-lg font-bold">
                                            {currentTaskId ? 'Atualizar tarefa' : 'Criar tarefa'}
                                        </Text>

                                        {/*Ícone aparece quando estiver ativo */}
                                        {isTituloValido && (
                                            <Feather name='chevron-right' size={20} color="white" />
                                        )}
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="bg-gray-100 rounded-2xl p-4 mb-10" // mb-10 garante que não encoste nos botões do android
                                onPress={() => navigation.goBack()}
                                disabled={loading}
                            >
                                <Text className="text-gray-500 text-center text-lg font-semibold">
                                    Cancelar
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}