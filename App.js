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

    // Toast de conclusão
      success: ({ text1 }) => (
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


