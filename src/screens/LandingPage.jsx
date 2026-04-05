import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // icones nativos do Expo

const LandingPage = ({ navigation }) => {

    const isAuthenticat = false;

    return (
        <SafeAreaView className="flex-1 bg-zinc-50">
            <StatusBar style="light" />
            <ScrollView showsHorizontalScrollIndicator={false}>

                {/* HERO SECTION */}
                <View className="bg-zinc-900 py-16 px-6 itemm-center rounded-b-[40px] shadow-xl">
                    <MaterialCommunityIcons name="check-decagram" size={60} color="#3b82f6" />
                    <Text className="text-white text-3xl font-extrabold text-center mt-4 tracking-tight">
                        Bem-vindo ao KeePace
                    </Text>
                    <Text className="text-zinc-400 text-lg text-center mt-2 px-4 leading-6">
                        Organize suas tarefas de forma simples e rápida.
                    </Text>
                    <View className="mt-8 w-full px-4">

                    </View>
                    {/* FEATURES SECTION */}
                    <View className="px-6 py-10">
                        <View className="items-center mb-8">
                            <Text className="text-zinc-900 text-2xl font-bold">Por que usar o KeePace?</Text>
                            <Text className="text-zinc-500 text-center mt-2 leading-5">
                            A ferramenta ideal para organizar sua rotina profissional e pessoal.
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default LandingPage;