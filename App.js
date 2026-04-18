import { StatusBar } from 'expo-status-bar';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Toast, { BaseToast } from 'react-native-toast-message';


//import LandingPage from './src/screens/LandingPage';
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
import { Feather } from '@expo/vector-icons';

const Stack = createStackNavigator();

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
          width: '90%',
          backgroundColor: '#ECFDF5', // verde bem leve
          borderRadius: 12,
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'center',
          borderLeftWidth: 5,
          borderLeftColor: '#10B981', // verde destaque
          elevation: 5,
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
            <Text style={{ color: '#047857', fontSize: 13 }}>
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
          height: 55,
          width: '90%',
          backgroundColor: '#333', // Fundo escuro estilo Snackbar
          borderRadius: 12,
          justifyContent: 'center',
          paddingHorizontal: 20,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          alignSelf: 'center'
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          {text1}
        </Text>
      </View>
    ),

    // Toast de conclusão
      error: ({ text1, text2 }) => (
      <View
        style={{
          height: 55,
          width: '90%',
          backgroundColor: '#FEF2F2', // Vermelho bem leve (fundo)
          borderRadius: 12,
          padding: 14,
          flexDirection: 'row',
          justifyContent: 'center',
          paddingHorizontal: 20,
          elevation: 10,
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          borderLeftWidth: 5,
          borderLeftColor: '#EF4444', // vermelho forte (destaque)
          elevation: 5,
          alignSelf: 'center',
          alignItems: 'center',
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

  const { user } = useAuth();

  {/*if(loading) {
    return false; // Ou um componente de loading
  }*/}

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

export default function App(){
  return(
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
        {/* Código para messages Toast estilizadas */}
            <Toast config={toastConfig} />
      </NavigationContainer>
    </AuthProvider>
  );
}


