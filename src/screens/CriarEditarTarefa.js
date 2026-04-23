import React, { useEffect, useState, useRef } from 'react';
import { Modal } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { Feather } from '@expo/vector-icons';
import { format, isToday, isTomorrow } from 'date-fns';
import { useAuth } from '../services/AuthContext';
import api from '../services/api'; // Instância do Axios
import Toast from 'react-native-toast-message'; // mensagens estilizadas mais profissional
import DateTimePicker from '@react-native-community/datetimepicker'; 


export default function CriarEditarTarefa({ navigation, route }) {

    
    const existingTask = route.params?.task;
    // Converte a string do banco para um objeto Date real se existir
    const initialDate = existingTask?.dueDate ? new Date(existingTask.dueDate) : null;
    // Foco para input para nova tarefa
    const inputRef = useRef();

    // Declaração Para botão remover prazo não ficar atrás dos botões do android
    const insets = useSafeAreaInsets();

    const { user } = useAuth();
    const [titulo, setTitulo] = useState(existingTask?.titulo || '');
    const [descricao, setDescricao] = useState(existingTask?.descricao || '');
    const [categoria, setCategoria] = useState(existingTask?.categoria || '');
    const [prioridade, setPrioridade] = useState(existingTask?.prioridade?.toUpperCase() || '');
    const [status, setStatus] = useState(existingTask?.status || 'TODO'); // Inicia com o STATUS A FAZER
    const [updatedAt, setUpdatedAt] = useState(existingTask?.updatedAt || new Date().toISOString());
    const [date, setDate] = useState(initialDate); // para dueDate
    const [showPicker, setShowPicker] = useState(false); // para dueDate
    const [mode, setMode] = useState('date'); // 'date' ou 'time' ? para dueDate
    const [loading, setLoading] = useState(false);
    const [currentTaskId, setCurrentTaskId] = useState(route.params?.task?.id || null);
    const [recorrencia, setRecorrencia] = useState(existingTask?.recorrencia || "NENHUMA")
    const [showRecorrenciaModal, setShowRecorrenciaModal] = useState(false);
    const [showPrazoModal, setShowPrazoModal] = useState(false);
  

    // Função para focar cursor do teclado para digitar título nova tarefa
    useEffect(() => {
        // Só foca se for NOVA tarefa
        if(!currentTaskId) {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 300); // pequeno delay evita bug de render

            return () => clearTimeout(timer);
        }
    }, []);

    // Função para route pegar tarefa da notificação
    useEffect(() => { // Route para usuário clicar na notificação e abrir a tarefa
        let isMounted = true; // Controle para evitar atualizar estado se sair da tela
        
        //Função para buscar tarefa pelo id e user quando receber por notificação e clicar
        const buscarTask = async () => { // Aqui o ser feito atualização da tarefa
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
                        setRecorrencia(response.data.recorrencia || 'NENHUMA');
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

     // Tags para categorias
        const categorias = [
            {label: 'Pessoal', value: 'PESSOAL', color: '#3B82F6', bg: '#DBEAFE',},
            {label: 'Trabalho', value: 'TRABALHO', color: '#10B981', bg: '#EDE9FE',},
            {label: 'Estudos', value: 'ESTUDOS', color: '#8B5CF6', bg: '#EDE9FE',},
        ];

        
        // Tags para prioridades
        const prioridades = [
            {label: 'Baixa', value: 'BAIXA', color: '#10B981', bg: '#D1FAE5', icon: 'arrow-down',}, // Cor verde
            {label: 'Média', value: 'MEDIA', color: '#F59E0B', bg: '#FEF3C7', icon: 'minus',},// Cor amarelo
            {label: 'Alta', value: 'ALTA', color: '#F97316', bg: '#FFEDD5', icon: 'arrow-up',},// Cor laranja
            {label: 'Urgente', value: 'URGENTE', color: '#EF4444', bg: '#FEE2E2', icon: 'alert-circle',},
        ];

        // Para recorrência de tarefas
        const opcoesRecorrencia = [
            { label: 'Não repetir', value: 'NENHUMA', icon: 'slash', color: '#6b7280', bg: '#E5E7EB' },
            { label: 'Todo dia', value: 'DIARIA', icon: 'sun', color: '#3b82f6', bg: '#DBEAFE' }, // azul
            { label: 'Toda semana', value: 'SEMANAL', icon: 'calendar',  color: '#8b5cf6', bg: '#EDE9FE' }, // roxo
            { label: 'Todo mês', value: 'MENSAL', icon: 'refresh-cw', color: '#f97316', bg: '#FFEDD5' }, // laranja
        ];

        // Função RECORRÊNCIA DE TAREFAS
        const recorrenciaSelecionada = opcoesRecorrencia.find(r => r.value === recorrencia);

        // Função definir cor no Modal Definir prazo
        const getCorPrazoInfo = (date) => {
            if (!date) {
                return {
                    label: '--',
                    color: '#9ca3af',
                    icon: 'calendar'
                };
            }

            const agora = new Date();

            if (date < agora && !isToday(date)) {
                return {
                    label: `Atrasado ${format(date, "HH:mm")}`,
                    color: '#dc2626',
                    icon: 'alert-circle'
                };
            }

            if (isToday(date)) {
                return {
                    label: `Hoje ${format(date, "HH:mm")}`,
                    color: '#16a34a',
                    icon: 'clock'
                };
            }

            if (isTomorrow(date)) {
                return {
                    label: `Amanhã ${format(date, "HH:mm")}`,
                    color: '#2563eb',
                    icon: 'calendar'
                };
            }

            return {
                label: format(date, "dd/MM"),
                color: '#6b7280',
                icon: 'calendar'
            };
        };

    // Função para salvar a tarefa e atualizar tarefa
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
                recorrencia: recorrencia, // Enviando a regra para o Model no Backend
                dueDate: formattedDateTime, // Formato para LocalDateTime Spring Boot do Java / envia null se usuário não escolher data
                // Verifica se for DONE, envia data atual, senão null
                concluido: isDone,
                dataConclusao: isDone ? format(new Date(), "yyyy-MM-dd'T'HH:mm:ss") : null,
                updatedAt: updatedAt
               
            };

            if (currentTaskId) { // Verifica se temos um ID (seja da lista ou da busca)
                console.log("Recorrencia enviada: ", recorrencia);

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

    // Declaração para MODAL PRAZO TAREFA mudar cores e textos
    const prazoInfo = getCorPrazoInfo(date);

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
                                ref={inputRef}
                                autoFocus={false} // deixa false, vai controlar manualmente
                                className={`bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4 text-base ${isTituloValido ? 'border-gray-200' : 'border-red-300'}`}
                                placeholder='Nova tarefa'
                                placeholderTextColor="#9ca3af"
                                value={titulo}
                                onChangeText={setTitulo}
                                maxLength={100}
                            />

                            <View className="mb-4">
                                <Text className="text-gray-600 font-medium mb-2 ml-1 flex-row items-center">
                                    <Feather name='tag' size={16} /> Categoria
                                    </Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {/* Categorias tags */}
                                    {categorias.map((cat) => {
                                        const isSelected = categoria === cat.value;

                                        return (
                                            <TouchableOpacity
                                                key={cat.value}
                                                onPress={() => setCategoria(categoria === cat.value ? '' : cat.value)}// Desmarca categoria
                                                style={{
                                                    paddingHorizontal: 14,
                                                    paddingVertical: 8,
                                                    borderRadius: 12,
                                                    borderWidth: isSelected ? 0 : 0.2,
                                                    backgroundColor: isSelected ? cat.color : cat.bg,
                                                    borderColor: cat.color,
                                                }}
                                            >
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Feather 
                                                        name='tag' size={14} 
                                                        color={isSelected ? '#fff' : cat.color} 
                                                        style={{ marginRight: 6 }}
                                                    />
                                                     <Text
                                                        style={{ fontWeight: '600', fontSize: 13, color: isSelected ? '#fff' : cat.color,}}
                                                     >
                                                        {cat.label}
                                                     </Text>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
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

                            <View className="mb-4">
                                <Text className="text-gray-600 font-medium mb-2 ml-1 flex-row items-center">
                                    <Feather name='flag' size={16} /> Prioridade
                                </Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {prioridades.map((p) => {
                                        const isSelected = prioridade === p.value;

                                        return (
                                            <TouchableOpacity
                                                key={p.value}
                                                onPress={() => 
                                                    setPrioridade(prioridade === p.value ? '' : p.value) // Permite desmarcar
                                                }
                                                style={{
                                                    paddingHorizontal: 10,
                                                    paddingVertical: 8,
                                                    borderRadius: 12,
                                                    borderWidth: isSelected ? 0 : 0.1,
                                                    backgroundColor: isSelected ? p.color : p.bg,
                                                    borderColor: p.color,
                                                }}
                                            >
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    {/* Ícone */}
                                                    <Feather 
                                                        name={p.icon} 
                                                        size={14}
                                                        color={isSelected ? '#fff' : p.color}
                                                        style={{ marginRight: 6 }}
                                                    />
                                                    <Text
                                                        style={{
                                                            fontWeight: '600',
                                                            fontSize: 13,
                                                            color: isSelected ? '#fff' : p.color,
                                                        }}
                                                    >
                                                        {p.label}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                           
                      <View className="mb-6">

                            {/* BOTÃO ÚNICO */}
                            <TouchableOpacity
                                onPress={() => setShowPrazoModal(true)}
                                className="bg-gray-50 border border-gray-200 rounded-3xl p-4 flex-row items-center justify-between"
                            >
                                <View className="flex-row items-center">
                                    <View
                                        style={{
                                            backgroundColor: recorrencia !== 'NENHUMA' ? recorrenciaSelecionada?.bg : '#DBEAFE',
                                            padding: 8,
                                            borderRadius: 12,
                                            marginRight: 12,
                                        }}
                                    >
                                        <Feather 
                                            name={recorrencia !== 'NENHUMA' ? recorrenciaSelecionada?.icon : 'calendar'}
                                            size={18} 
                                            color={recorrencia !== 'NENHUMA' ? recorrenciaSelecionada?.color : '#3b82f6'} />
                                    </View>

                                    <View>
                                        <Text className="text-gray-400 text-xs">
                                            Prazo da tarefa
                                        </Text>

                                        <Text className="text-gray-800 font-semibold">
                                            {date
                                                ? format(date, "dd/MM/yyyy 'às' HH:mm")
                                                : 'Definir prazo'}
                                        </Text>

                                        {/* Recorrência resumida */}
                                        {recorrencia !== 'NENHUMA' && (
                                            <Text className="text-xs mt-1"
                                                style={{ color: recorrenciaSelecionada?.color }}>
                                                {recorrenciaSelecionada?.label}
                                            </Text>
                                        )}
                                    </View>
                                </View>

                                <Feather name="chevron-right" size={18} color="#9ca3af" />
                            </TouchableOpacity>
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

            {/* Modal para Repetir tarefa */}
            <Modal
                visible={showRecorrenciaModal}
                animationType="slide"
                transparent={true}
            >
                <View className="flex-1 bg-black/40 justify-end">
                {/* OVERLAY (fecha ao clicar fora) */}
                <TouchableOpacity
                    className="flex-1"
                    activeOpacity={1}
                    onPress={() => setShowRecorrenciaModal(false)}
                />
                {/* CONTEÚDO */}
                    <View 
                        style={{ paddingBottom: 24 + insets.bottom }}
                        className="bg-white rounded-t-3xl p-6">
                        {/* HEADER */}
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-lg font-bold text-gray-800">
                                Repetir tarefa
                            </Text>
                            <TouchableOpacity onPress={() => setShowRecorrenciaModal(false)}>
                                <Feather name="x" size={22} color="#6b7280" />
                            </TouchableOpacity>
                        </View>
                        {opcoesRecorrencia.map((item) => {
                        const isSelected = recorrencia === item.value;

                        return (
                            <TouchableOpacity
                                key={item.value}
                                onPress={() => {
                                    setRecorrencia(item.value);
                                    setShowRecorrenciaModal(false);
                                }}
                                className="p-4 rounded-xl mb-2 flex-row items-center justify-between"
                                style={{
                                    backgroundColor: isSelected ? item.bg : '#F9FAFB',
                                }}
                            >
                                {/* LADO ESQUERDO */}
                                <View className="flex-row items-center">
                                    <View 
                                        style={{
                                            backgroundColor: item.bg,
                                            padding: 10,
                                            borderRadius: 12,
                                            marginRight: 12,
                                    }}>
                                        <Feather
                                            name={item.icon}
                                            size={16}
                                            color={item.color}
                                        />
                                    </View>
                                    <Text
                                       style={{
                                            color: isSelected ? item.color : '#374151',
                                            fontWeight: '600',
                                            fontSize: 15,
                                        }}
                                    >
                                        {item.label}
                                    </Text>
                                </View>

                                {/* CHECK */}
                                {isSelected && (
                                    <Feather name="check" size={18} color={item.color} />
                                )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </Modal>
            {/* MODAL PARA DEFINIR PRAZO DATA, HORA E REPETIR TAREFA */}
            <Modal
                visible={showPrazoModal}
                animationType="slide"
                transparent
            >
                <View className="flex-1 bg-black/40 justify-end">

                    {/* FECHAR AO CLICAR FORA */}
                    <TouchableOpacity
                        className="flex-1"
                        activeOpacity={1}
                        onPress={() => setShowPrazoModal(false)}
                    />

                    {/* CONTEÚDO */}
                    <View 
                        style={{ paddingBottom: 24 + insets.bottom }}
                        className="bg-white rounded-t-3xl px-6 pt-6">

                        {/* HEADER */}
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-lg font-bold text-gray-800">
                                Definir prazo
                            </Text>

                            <TouchableOpacity onPress={() => setShowPrazoModal(false)}>
                                <Feather name="x" size={22} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        {/* DATA */}
                        <TouchableOpacity
                            onPress={() => showMode('date')}
                            className="bg-gray-50 p-4 rounded-xl mb-3 flex-row items-center justify-between"
                        >
                            <View className="flex-row items-center">
                                <Feather name='calendar' size={18} color={prazoInfo.color} style={{ marginRight: 10 }} />
                                <Text className="text-gray-700 font-semibold">
                                    Selecionar data
                                </Text>
                            </View>
                            <Text 
                                style={{ 
                                    color: prazoInfo.color,
                                    fontWeight: '600'
                                }}
                            >
                                {date ? (isToday(date) ? 'Hoje' : isTomorrow(date) ? 'Amanhã' : format(date, "dd/MM")) : '--'}
                            </Text>
                        </TouchableOpacity>

                        {/* HORA */}
                        <TouchableOpacity
                            onPress={() => date && showMode('time')}
                            disabled={!date}
                            style={{ opacity: !date ? 0.5 : 1 }}
                            className="bg-gray-50 p-4 rounded-xl mb-3 flex-row items-center justify-between"
                        >
                            <View className="flex-row items-center">
                                <Feather name='clock' 
                                    size={18} 
                                    color={prazoInfo.color} 
                                    style={{ marginRight: 10 }} />
                                <Text className="text-gray-700 font-semibold">
                                    Selecionar hora
                                </Text>
                            </View>
                            <Text 
                                style={{ 
                                    color: prazoInfo.color,
                                    fontWeight: '600'
                                }}
                            >
                                {date ? format(date, "HH:mm") : '--'}
                            </Text>
                        </TouchableOpacity>

                        {/* RECORRÊNCIA */}
                        <TouchableOpacity
                            onPress={() => setShowRecorrenciaModal(true)}
                            className="bg-gray-50 p-4 rounded-xl mb-4 flex-row items-center justify-between"
                        >
                            <View className="flex-row items-center">
                                <Feather name='repeat' size={18} color={recorrenciaSelecionada?.color} style={{ marginRight: 10 }} />
                                <Text className="text-gray-700 font-semibold">
                                    Repetir tarefa
                                </Text>
                            </View>
                            <Text
                                style={{ color: recorrenciaSelecionada?.color }}
                                className="font-semibold"
                            >
                                {recorrenciaSelecionada?.label}
                            </Text>
                        </TouchableOpacity>

                        {/* REMOVER */}
                        {date && (
                            <TouchableOpacity
                                onPress={() => setDate(null)}
                                className="p-3"
                            >
                                <Text className="text-red-500 text-center font-semibold">
                                    Remover prazo
                                </Text>
                            </TouchableOpacity>
                        )}

                        {/* PICKER */}
                        {showPicker && (
                            <DateTimePicker
                                value={date || new Date()}
                                mode={mode}
                                is24Hour
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onChange}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}