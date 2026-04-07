import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../services/AuthContext';
import api from '../services/api'; // Instância do Axios

export default function CriarEditarTarefa({ navigation, route }) {

    const existingTask = route.params?.task;

    const { user } = useAuth();
    const [titulo, setTitulo] = useState(existingTask?.titulo || '');
    const [descricao, setDescricao] = useState(existingTask?.descricao || '');
    const [categoria, setCategoria] = useState(existingTask?.categoria || 'PESSOAL');
    const [status, setStatus] = useState(existingTask?.status || 'TODO'); // Inicia com o STATUS A Fazer
    const [dueDate, setDueDate] = useState(existingTask?.dueDate || new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    const saveTask = async () => {
        if (!titulo.trim()) {
            Alert.alert('Erro', 'O título da tarefa é obrigatório');
            return;
        }

        setLoading(true);

        try {
            // Garantindo para LocalDateTime válido para o Spring Boot (Backend)
            // Se o dueDate for "2026-12-31", vira "2026-12-31T00:00:00"
            const formattedDateTime = `${dueDate}T00:00:00`;

            const taskData = {
                titulo: titulo.trim(),
                descricao: descricao.trim(),
                categoria: categoria,
                status: status,
                dueDate: formattedDateTime, // Formato para LocalDateTime Spring Boot do Java
                // O concluido o Java seta como default no POST (Backend)
            };

            if (existingTask) {
                // Atualizar (PUT)
                await api.put(`/tasks/tarefas/${existingTask.id}`, taskData);
                Alert.alert('Sucesso', 'Tarefa atualizada com sucesso!');
                console.log("Dados sendo atualizados:", JSON.stringify(taskData, null, 2));
            } else {
                // Criar novo (POST)
                await api.post('/tasks/tarefas', taskData);
                Alert.alert('Sucesso', 'Tarefa criada com sucesso!');
                console.log("Dados sendo cadastrados:", JSON.stringify(taskData, null, 2));
            }
            navigation.goBack();
        } catch (error) {
            console.log('Erro ao salvar a tarefa:', error);
            const msg = error.response?.data?.message || 'Não foi possível salvar a tarefa';
            Alert.alert('Erro', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-gray-100 p-6 justify-center">
            <View className="bg-white ronded-3xl p-6 shadow-xl">
                <Text className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    {existingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
                </Text>
                <Text className="text-gray-600 font-medium mb-2 ml-1">Titulo da Tarefa</Text>
                <TextInput
                 className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4 text-base text-gray-800"
                 placeholder='Ex: Estudar React Native'
                 placeholderTextColor="#9ca3af"
                 value={titulo}
                 onChangeText={setTitulo}
                 maxLength={100}
                />

                <Text className="text-gray-600 font-medium mb-2 ml-1">Categoria</Text>
                <View className="bg-gray-50 border border-gry-200 rounded-2xl mb-4 overflow-hidden">
                    <Picker
                     selectedValue={categoria}
                     onValueChange={(itemValue) => setCategoria(itemValue)}
                    >
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

                <Text>Prazo de Entrega</Text>
                <TextInput
                 className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-1 text-base"
                 value={dueDate}
                 onChangeText={setDueDate}
                 placeholder='Ex: 2024-12-3'
                 keyboardType='numeric'
                 maxLength={10}
                />
                <Text className="text-gray-400 text-xs mb-4 ml-1">
                    Use o formato Ano-Mês-Dia (Ex: 2024-05-20)
                </Text>
                <TouchableOpacity
                 className={`rounded-2xl p-4 mb-3 shadow-md ${loading ? 'bg-blue-400' : 'bg-blue-600'}`}
                 onPress={saveTask}
                 disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white text-center text-lg font-bold">
                            {existingTask ? 'Salvar Alterações' : 'Criar Tarefa'}
                        </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                 className="bg-gray-100 rounded-2xl p-4"
                 onPress={() => navigation.goBack()}
                 disabled={loading}
                >
                    <Text className="text-gray-500 text-center text-lg font-semibold">
                        Cancelar
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}