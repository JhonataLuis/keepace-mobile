import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const registerForPushNotificationsAsync = async () => {
    let token;
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

    if (Device.isDevice) {
        const { status : existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            alert('Falha ao obter permissão para notificações!');
            console.log("Permission status:", finalStatus);
            return;
        }

        token = (await Notifications.getExpoPushTokenAsync({
            projectId
        })).data;
     } else {
        alert('Notificações físicas exigem um dispositivo real.');
     }

     return token;
};