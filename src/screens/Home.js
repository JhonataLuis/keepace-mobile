import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

import { useAuth } from '../services/AuthContext';

export default function Home({ navigation }) {

    const { user, logout } = useAuth();
    const [ stats, setStats ] = useState({
        total: 0,
        completed: 0,
        pending: 0
    });

    return ( 
        <SafeAreaView className="flex-1 bg-zinc-950 p-4">
              <View className="mt-10">
                <Text className="text-2xl font-bold text-white">KeePace Mobile</Text>
                <Text className="text-zinc-400">Gerencie suas tarefas com segurança</Text>
                <StatusBar style="auto" />
              </View>
              <View className="mt-6 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
                <Text className="text-blue-400 font-semibold">Tarefa Importante</Text>
                <Text className="text-zinc-300 mt-1">Configurar a API do Spring Boot</Text>
              </View>
        </SafeAreaView>
    )
}