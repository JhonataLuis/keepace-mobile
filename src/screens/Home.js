import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

export default function Home({ navigation }) {
    const { user, logout } = useAuth();
    const [ stats, setStats ] = useState({
        total: 0,
        completed: 0,
        pending: 0
    });
}