
// Coloque no topo do arquivo, antes dos imports
console.log("=== INICIANDO APP ===");

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { createStackNavigator } from '@react-navigation/stack';
import Toast, { BaseToast } from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';
import { registerForPushNotificationsAsync } from './src/components/useNotification';
import api from './src/services/api';
import { navigationRef } from './src/components/navigationRef';
import { AuthProvider, useAuth } from './src/services/AuthContext';
import Login from './src/screens/Login';
import Home from './src/screens/Home';
import ListaTarefas from './src/screens/ListaTarefas';
import CriarEditarTarefa from './src/screens/CriarEditarTarefa';
import TarefasConcluidas from './src/screens/TarefasConcluidas';
import MyPerfil from './src/screens/MyPerfil';
import Register from './src/screens/Register';
import ForgotPassword from './src/screens/ForgotPassword';
import ResetPassword from './src/screens/ResetPassword';


const Stack = createStackNavigator();

// Configuração de como a notificação aparece com o app aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function NotificationManager() {
  const { user } = useAuth();

  // Função auxiliar para navegar usando a Ref Global
  const safeNavigate = (screen, params) => {
    if (navigationRef.isReady()) {
      navigationRef.navigate(screen, params);
    } else {
      // Se a navegação não estiver pronta, tenta novamente em 500ms
      setTimeout(() => safeNavigate(screen, params), 500);
    }
  };

  useEffect(() => {
    if(!user) return;

    // Registra o token do Backend
    const setupToken = async () => {
      const token = await registerForPushNotificationsAsync();

      if (token) {
        await api.patch(`/users/push-token`, { expoPushToken: token });
        console.log("Buscando tarefa no backend pelo Notifications: {} ");
      }
    };

    setupToken();

    // Ouvinte para quando o usuário clica na notificação com o APP ABERTO ou em BACKGROUND
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;

      if (data?.taskId){
          setTimeout(() => {
            console.log("Abrir tarefa (via listener):", data.taskId);
            safeNavigate('CriarEditarTarefa', { taskId: data.taskId });
          }, 100);
      }
    });

    return () => subscription.remove();
  }, [user]);

  // App fechado (Cold Start) -> abriu pela notificação
  useEffect(() => {

    const checkNotification = async () => {
      if (!user) return; // Espera o usuário estar logado

      // Delay para garantir que a árvore de navegação carregou
      await new Promise(resolve => setTimeout(resolve, 800)); // Espera o Navigator estabilizar
      
      const response = await Notifications.getLastNotificationResponseAsync();
      
      // CRÍTICO: Verificar se o navigationRef está pronto antes de agir
      if (response && user && navigationRef.isReady()) { // Adicionado o check de user aqui por segurança
        const data = response.notification.request.content.data;

        if (data?.taskId) {
          console.log("Abrir tarefa (cold start):", data.taskId);
          safeNavigate('CriarEditarTarefa', { taskId: data.taskId });
        }
      }
    };
    checkNotification();
  }, [user]); // Adicionado user aqui para garantir que ele só navegue se estiver logado

  return null; // ESSENCIAL: NotificationManager precisa retornar algo
}

const toastConfig = {
    undoAction: ({ text1, props }) => (
      <View
        style={{
          height: 55,
          width: '90%',
          backgroundColor: '#333', // Fundo escuro estilo Snackbar
          borderRadius: 12,  // Mais arredondado
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          alignSelf: 'center'
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold', flex: 1 }}>{text1}</Text>
        <TouchableOpacity
          onPress={() => {
            console.log("Botão desfazer clicado!");
            props.onUndo();
            Toast.hide(); // Esconde o toast ao clicar em desfazer
          }}
        >
          <Text style={{ color: '#4ade80', fontWeight: 'bold', marginLeft: 10 }}>Desfazer</Text>
        </TouchableOpacity>
      </View>
    ),

    success: ({ text1, text2 }) => (
      <View
        style={{
          minHeight: 60,
          width: '90%',
          backgroundColor: '#ECFDF5', // verde bem leve
          borderRadius: 12,
          paddingVertical: 12,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'center',
          borderLeftWidth: 5,
          borderLeftColor: '#10B981', // verde destaque
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        }}
      >
        {/* Ícone */}
        <Feather name="check-circle" size={20} color="#10B981" style={{ marginRight: 10 }} />

        {/* Textos */}
        <View style={{ flex: 1 }}>
          {text1 && (
            <Text style={{ color: '#065F46', fontWeight: 'bold', fontSize: 14 }}>
              {text1}
            </Text>
          )}
          {text2 && (
            <Text style={{ color: '#047857', fontSize: 12 }}>
              {text2}
            </Text>
          )}
        </View>
      </View>
    ),

    // Toast para deletar tarefa
    delete: ({ text1 }) => (
      <View
        style={{
          minHeight: 55,
          width: '90%',
          backgroundColor: '#1F2937', // Cinza escuro elegante
          borderRadius: 12,
          justifyContent: 'center',
          paddingVertical: 12,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'center',
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.3,
          shadowRadius: 6,

        }}
      >
        {/* ícone */}
        <Feather
          name='trash-2'
          size={20}
          color="#F87171" // Vermelho suave
          style={{ marginRight: 10 }}
        />
         {/* Texto */}
        <Text 
          style={{ color: '#F9FAFB', fontWeight: 600, fontSize: 14, flex: 1, 
          }}
          numberOfLines={2}
          >
          {text1}
        </Text>
      </View>
    ),

    // Toast de conclusão
      error: ({ text1, text2 }) => (
      <View
        style={{
          minHeight: 60,
          width: '90%',
          backgroundColor: '#FEF2F2', // Vermelho bem leve (fundo)
          borderRadius: 12,
          paddingVertical: 12,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'center',
          borderLeftWidth: 5,
          borderLeftColor: '#EF4444', // vermelho forte (destaque)
          elevation: 5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        
        }}
      >
        {/* Ícone */}
        <Feather name='alert-circle' size={20} color="#EF4444" style={{ marginRight: 10 }} />
        {/* Textos */}
        <View style={{ flex: 1 }}>
          {text1 && (
             <Text style={{ color: '#991B1B', fontWeight: 'bold', fontSize: 14 }}>
                {text1}
            </Text>
          )}
          {text2 && (
             <Text style={{ color: '#7F1D1D', fontWeight: 'bold', fontSize: 12 }}>
                {text2}
            </Text>
          )}
        </View>
      </View>
    )
  };

function AppNavigator() {

  const { user, loading } = useAuth();

  if(loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Rotas não autenticadas
          <>
          <Stack.Screen 
            name="Login"
            component={Login}
            /*options={{ headerShown: false }}*/
          />
          <Stack.Screen 
            name="Register"
            component={Register}
            options={{ title: 'Register' }}
          />
          <Stack.Screen 
            name='ForgotPassword'
            component={ForgotPassword}
            options={{ title: 'ForgotPassword' }}
          />
          <Stack.Screen 
            name='ResetPassword'
            component={ResetPassword}
            options={{ title: 'ResetPassword' }}
          />
          </>
        ) : (
          // Rotas autenticadas
          <>
            <Stack.Screen 
             name="Home"
             component={Home}
             options={{ title: 'Dashboard' }}
            />
            <Stack.Screen 
             name="ListaTarefas"
             component={ListaTarefas}
             options={{ title: 'Minhas Tarefas' }}
            />
            <Stack.Screen 
             name="CriarEditarTarefa"
             component={CriarEditarTarefa}
             options={{ title: 'Tarefa' }}
            />
            <Stack.Screen
             name='TarefasConcluidas'
             component={TarefasConcluidas}
             options={{ headerShown: false }}
            />
            <Stack.Screen 
             name="Perfil"
             component={MyPerfil}
             options={{ title: 'Meu Perfil' }}
            />
          </>
        )}
      </Stack.Navigator>
  );
}

// E no final do arquivo, antes do export
console.log("=== APP RENDERIZADO ===");

export default function App(){
  return(
    <AuthProvider>
      <NavigationContainer ref={navigationRef}>
        <NotificationManager /> {/* Notifications */}
        <AppNavigator />
        {/* Código para messages Toast estilizadas */}
            <Toast config={toastConfig} />
      </NavigationContainer>
    </AuthProvider>
  );
}


