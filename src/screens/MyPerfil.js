import React, { useState } from 'react';
import { Image, View, Text, TouchableOpacity, ScrollView, Switch, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../services/AuthContext';
import Toast from 'react-native-toast-message';
import { TextInput } from 'react-native-gesture-handler';


export default function Perfil({ navigation }) {
    const { user, logout } = useAuth();
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [senhaAtual, setSenhaAtual] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [showPassword, setShowPassword] = useState(false); // Olhinho para mostrar e ocultar senha
    const [loading, setLoading] = useState(false);

    const BASE_URL = "http://192.168.5.115:8080";

    // Regex para validar senha no padrão de cadastro
    const validatePassword = (password) => {
        const re = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&.]).{8,}$/;
        return re.test(password);
    };

    const handleUpdatePassword = async () => {

        // Validação de preenchimento
        if (!senhaAtual || !novaSenha || !confirmarSenha) {
            Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: 'Preencha todos os campos!',
                visibilityTime: 3000, // Define quanto tempo o tast fica visível
                autoHide: true, // Define se o toast some sozinho
                topOffset: 50, // Define a distância do topo da tela
            });
            return;
        }

        // Validação de força da senha (Regex)
        if (!validatePassword(novaSenha)) {
            Toast.show({
                type: 'error',
                text1: 'Senha Fraca',
                text2: 'Mínimo 8 caracteres, com letras, números e especial.',
                visibilityTime: 3000, // Define quanto tempo o tast fica visível
                autoHide: true, // Define se o toast some sozinho
                topOffset: 50, // Define a distância do topo da tela
            });
            return;
        }

        // Validação de igualdade
        if (novaSenha !== confirmarSenha) {
            Toast.show({ 
                type: 'error',
                text1: 'Erro',
                text2: 'As novas senhas não coincidem!',
                visibilityTime: 3000, // Define quanto tempo o tast fica visível
                autoHide: true, // Define se o toast some sozinho
                topOffset: 50, // Define a distância do topo da tela
            });
            return;
        }
        
        setLoading(true)
        try {
            const response = await api.put('/users/change-password', {
                currentPassword: senhaAtual,
                newPassword: novaSenha
            });

            Toast.show({
                type: 'success',
                text1: 'Sucesso!',
                text2: response.data.message,
                visibilityTime: 3000, // Define quanto tempo o tast fica visível
                autoHide: true, // Define se o toast some sozinho
                topOffset: 50, // Define a distância do topo da tela
            });

            setIsPasswordModalVisible(false);
            // Limpar campos
            setSenhaAtual('');
            setNovaSenha('');
            setConfirmarSenha('');

        } catch (error) {
            const msg = error.response?.data?.message || 'Erro ao alterar senha';
            Toast.show({
                type: 'error',
                text1: 'Falha',
                text2: msg,
                visibilityTime: 3000, // Define quanto tempo o tast fica visível
                autoHide: true, // Define se o toast some sozinho
                topOffset: 50, // Define a distância do topo da tela
            });
        } finally {
            setLoading(false);
        }
    };

    // Função profissional para avisar sobre funções em desenvolvimento
    const handleCommingSoon = (feature) => {
        Toast.show({
            typeof: 'info',
            text1: 'Em desenvolvimento',
            text2: `${feature} estará disponível em breve no KeePace!`,
            visibilityTime: 3000,
        });
    };

    console.log("Perfil:", user);
    console.log("Nome USER:", user?.name);

    const MenuOption = ({ icon, title, subtitle, onPress, color = "text-gray-700", isLast = false, isComingSoon = false }) => (
        <TouchableOpacity
          onPress={isComingSoon ? () => handleCommingSoon(title) : onPress}
          activeOpacity={0.7}
          className={`flex-row items-center py-4 ${!isLast ? 'border-b border-gray-100' : ''} ${isComingSoon ? 'opacity-60' : ''}`}
        >
            <View className={`p-2 rounded-lg ${isComingSoon ? 'bg-gray-100' : 'bg-blue-100'}`}>
                <Feather name={icon} size={20} color={isComingSoon ? "#9ca3af" : "#3b82f6"}/>
            </View>
            <View className="flex-1 ml-4">
                <View className="flex-row items-center">
                    <Text className={`text-base font-semibold ${isComingSoon ? 'text-gray-400' : color}`}>{title}</Text>
                    {isComingSoon && (
                        <View className="bg-amber-100 px-2 py-0.5 rounded-full ml-2 border border-amber-200">
                            <Text className="text-[8px] font-bold text-amber-600 uppercase">Em breve</Text>
                        </View>
                    )}
                </View>
                    {subtitle && <Text className="text-xs text-gray-400">{subtitle}</Text>}
            </View>
            {!isComingSoon && <Feather name='chevron-right' size={16} color="#d1d5db" />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-blue-50">
            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="items-center pt-8 pb-10 px-6">
                    <View className="relative">
                        <View className="w-24 h-24 bg-blue-600 rounded-full items-center justify-center shadow-xl shadow-blue-300 overflow-hidden border-2 border-white">
                            {user?.profilePhoto ? (
                                <Image
                                 source={{ uri: `${BASE_URL}${user.profilePhoto}?t=${new Date().getTime()}` }}
                                 className="w-full h-full rounded-full"
                                 resizeMode='cover'
                                />
                            ) : (

                                <Text className="text-white text-3xl font-bold">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </Text>
                            )}

                        </View>
                        <TouchableOpacity 
                            className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-gray-50"
                            onPress={() => handleCommingSoon('Troca de foto')}
                            >
                            <Feather name='camera' size={16} color="#3b82f6" />
                        </TouchableOpacity>
                    </View>
                    <Text className="text-2xl font-bold text-gray-800 mt-4">{user?.name || 'Usuário'}</Text>
                    <Text className="text-gray-500">{user?.email || 'email@exemplo.com'}</Text>
                </View>
            

            {/* Seção: Conta */}
            <View className="px-6 mb-6">
                <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Minha Conta</Text>
            
                    <View className="bg-white rounded-3xl px-4 shadow-sm border border-blue-50">
                        <MenuOption 
                            icon="user"
                            title="Dados Pessoais"
                            subtitle="Editar nome e informações"
                            isComingSoon={true} 
                        />

                        <MenuOption 
                            icon="lock"
                            title="Segurança"
                            subtitle="Alterar senha e privacidade"
                            onPress={() => setIsPasswordModalVisible(true)} // Abre o Modal
                        />

                        <MenuOption 
                            icon="bell"
                            title="Notificações"
                            subtitle="Configurar lembretes de tarefas"
                            isLast={true}
                            isComingSoon={true}
                        />
                    </View>
                </View>

                {/* Seção: App & Preferências  */}
                <View className="px-5 mb-6">
                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Preferências</Text>
                    <View className="bg-white rounded-3xl px-4 shadow-sm border border-blue-100">
                        {/* Modo Escuro (Visual Desabilitado) */}
                        <View className="flex-row items-center py-4 border-b border-gray-100 opacity-50">
                            <View className="bg-blue-100 p-2 rounded-lg">
                                <Feather name='moon' size={20} color="#3b82f6" />
                            </View>
                            <View className="flex-1 ml-4">
                                <Text className="text-base font-semibold text-gray-700">Modo Escuro</Text>
                            </View>
                            <Switch 
                                disabled={true}
                                trackColor={{ false: "#d1d5db", true: "#bfdbfe" }}
                                thumbColor="#f4f3f4"
                            />
                        </View>
                        <MenuOption 
                            icon="help-circle"
                            title="Ajuda & Suporte"
                            isLast={true}
                            isComingSoon={true}
                        />
                    </View>
                </View>

                {/* Botão de Sair */}
                <View className="px-6 mb-12">
                    <TouchableOpacity
                        onPress={logout}
                        className="bg-red-50 flex-row items-center justify-center p-4 rounded-2xl border border-red-100"
                    >
                        <Feather name='log-out' size={20} color="#ef4444" />
                        <Text className="ml-2 text-red-500 font-bold text-lg">Sair da Conta</Text>
                    </TouchableOpacity>
                        <Text className="text-center text-gray-300 text-[10px] mt-6 tracking-tighter">
                            KeePace v1.0.0
                        </Text>
                </View>
            </ScrollView>

            {/* Modal de Alterar Senha (Bottom Sheet) */}
            <Modal
                animationType='slide'
                transparent={true}
                visible={isPasswordModalVisible}
                onRequestClose={() => !loading && setIsPasswordModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                {/* bg-black/50 cria o fundo escurecido atrás da meia tela */}

                    <TouchableOpacity
                        className="flex-1"
                        activeOpacity={1}
                        onPress={() => !loading && setIsPasswordModalVisible(false)}
                    />

                    <View className="bg-white rounded-t-[40px] p-8 shadow-2xl" style={{ minHeight: '65%' }}>
                       {/* "Handle" visual no topo do modal  */}
                        <View className="w-12 h-1.5 bg-gray-200 rounded-full self-center mb-8"/>
                        
                            <Text className="text-xl font-bold text-gray-800 mb-2">Segurança</Text>
                            <Text className="text-gray-400 mb-6">
                               Mantenha sua conta protegida atualizando sua senha.
                            </Text>

                            <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
                                {/* Senha Atual */}
                                <View className="mb-4">
                                    <Text className="text-gray-700 font-semibold mb-2 ml-1">Senha Atual</Text>
                                    <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                                        <Feather name='lock' size={20} color="#9ca3af" />
                                        <TextInput
                                            className="flex-1 ml-3 text-gray-700"
                                            placeholder='Digite a senha atual'
                                            secureTextEntry={!showPassword}
                                            value={senhaAtual}
                                            onChangeText={setSenhaAtual}
                                        />
                                    </View>
                                </View>

                                {/* Nova Senha */}
                                <View className="mb-4">
                                    <Text className="text-gray-700 font-semibold mb-2 ml-1">Nova Senha</Text>
                                    <View className={`flex-row items-center bg-gray-50 border rounded-2xl px-4 py-3 ${
                                        novaSenha.length > 0 && !validatePassword(novaSenha) ? 'border-orange-400' : 'border-gray-200'
                                    }`}>
                                        <Feather name="shield" size={20} color="#9ca3af" />
                                        <TextInput 
                                            className="flex-1 ml-3 text-gray-700"
                                            placeholder='Nova senha'
                                            secureTextEntry={!showPassword}
                                            value={novaSenha}
                                            onChangeText={setNovaSenha}
                                        />
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                            <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="#9ca3af" />
                                        </TouchableOpacity>
                                    </View>
                                    <Text className={`text-[10px] mt-1 ml-1 ${
                                        novaSenha.length > 0 && !validatePassword(novaSenha) ? 'text-orange-500' : 'text-gray-400'
                                    }`}>
                                        Mínimo 8 caracteres, com letras, números e especial.
                                    </Text>
                                </View>

                                {/* Confirmar Nova Senha */}
                                <View className="mb-8">
                                    <Text className="text-gray-700 font-semibold mb-2 ml-1">Confirmar Nova Senha</Text>
                                    <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                                        <Feather name="check-circle" size={20} color="#9ca3af" />
                                        <TextInput 
                                            className="flex-1 ml-3 text-gray-700"
                                            placeholder='Repita a nova senha'
                                            secureTextEntry={!showPassword}
                                            value={confirmarSenha}
                                            onChangeText={setConfirmarSenha}
                                        />
                                    </View>
                                </View>
                            </ScrollView>

                            <View className="mt-4">
                                <TouchableOpacity
                                   onPress={handleUpdatePassword}
                                   disabled={loading}
                                    className={`bg-blue-600 p-4 rounded-2xl items-center shadow-lg shadow-blue-300 ${loading ? 'opacity-70' : ''}`}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                         <Text className="text-white text-center font-bold text-lg">
                                            Atualizar Senha
                                          </Text>
                                    )}
                                </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setIsPasswordModalVisible(false)}
                                disabled={loading}
                                className="mt-4 p-2"
                            >
                                <Text className="text-gray-400 text-center font-semibold">Cancelar</Text>
                            </TouchableOpacity>
                        </View>     
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}