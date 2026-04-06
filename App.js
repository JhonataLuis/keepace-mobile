import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


//import LandingPage from './src/screens/LandingPage';
import { AuthProvider, useAuth } from './src/services/AuthContext';
import Login from './src/screens/Login';
import Home from './src/screens/Home';
import ListaTarefas from './src/screens/ListaTarefas';

const Stack = createStackNavigator();

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
          {/*<Stack.Screen 
           name="Registro"
           component={Registro}
           options={{ title: 'Cadastro' }}
          />*/}
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
            {/*<Stack.Screen 
             name="CriarEditarTarefa"
             component={CriarEditarTarefa}
             options={{ title: 'Tarefa' }}
            />
            <Stack.Screen 
             name="Perfil"
             component={Perfil}
             options={{ title: 'Meu Perfil' }}
            />*/}
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
      </NavigationContainer>
    </AuthProvider>
  );
}


