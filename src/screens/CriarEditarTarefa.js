import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../services/AuthContext';
import api from '../services/api'; // Instância do Axios

export default function CriarEditarTarefa({ navigation, route }) {

    const { user } = useAuth();
    const existingTask = route.params?.task;
    const [titulo, setTitulo] = useState(existingTask?.titulo || '');
    const [descricao, setDescricao] = useState(existingTask?.descricao || '');
    const [loading, setLoading] = useState(false);

    const saveTask = async () => {
        if (!titulo.trim()) {
            Alert.alert('Erro', 'O título da tarefa é obrigatório');
            return;
        }

        setLoading(true);

        try {
            const taskData = {
                titulo: titulo.trim(),
                descricao: descricao.trim(),
                // O Status e o concluido o Java seta como default no POST (Backend)
            };

            if (existingTask) {
                // Atualizar (PUT)
                await api.put(`/tasks/tarefas/${existingTask.id}`, taskData);
                Alert.alert('Sucesso', 'Tarefa atualizada com sucesso!');
            } else {
                // Criar novo (POST)
                await api.post('/tasks/tarefas', taskData);
                Alert.alert('Sucesso', 'Tarefa criada com sucesso!');
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