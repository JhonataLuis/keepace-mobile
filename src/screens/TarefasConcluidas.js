import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView  } from 'react-native-safe-area-context';
import { Feather} from '@expo/vector-icons';
import api from '../services/api';
//import { userAuth } from '../services/AuthContext';

export default function TarefasConcluidas({ navigation }) {

    //const [user] = userAuth();
    const [completedTasks, setCompletedTasks] = useState([]);
    const [loading, setLoading] = useState(true);

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
            <View className="flex-row items-center mb-2">
                <Feather name="check-circle" size={20} color="#16a34a" />
                <Text className="ml-2 text-base font-bold text-gray-800 line-through">
                    {item.titulo}
                </Text>
            </View>

            <View className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <View className="flex-row items-center mb-1">
                    <Feather name="user" size={14} color="#6b7280" />
                    <Text className="ml-2 text-xs text-gray-600">
                        Finalizado por: <Text className="font-semibold text-gray-700">{item.username}</Text>
                    </Text>
                </View>
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
        </SafeAreaView>
    );
}