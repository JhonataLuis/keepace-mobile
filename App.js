import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LandingPage from './components/LandingPage';

export default function App() {
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

      <StatusBar style='light' />

      <LandingPage/>
    </SafeAreaView>
  );
}


