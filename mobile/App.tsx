import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, View, Text, TextInput, TouchableOpacity, StatusBar as RNStatusBar, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  // We need the local IP address because 'localhost' on the phone refers to the phone itself, not the computer.
  // We provide a simple UI to enter this IP.
  const [url, setUrl] = useState(''); 
  const [inputUrl, setInputUrl] = useState('http://192.168.1.X:3001'); // Example placeholder
  const [isConnected, setIsConnected] = useState(false);

  // Configuration Screen
  if (!isConnected) {
    return (
      <SafeAreaView style={styles.configContainer}>
        <StatusBar style="light" />
        <View style={styles.content}>
            <View style={styles.iconContainer}>
               <Text style={styles.icon}>🎓</Text>
            </View>
            <Text style={styles.title}>EDUConnect Mobile</Text>
            
            <Text style={styles.label}>Para conectar, insira o endereço IP local do seu computador onde o Frontend está rodando:</Text>
            <Text style={styles.hint}>Procure por "Network" ao rodar 'npm run dev' no PC.</Text>
            
            <TextInput 
                style={styles.input}
                value={inputUrl}
                onChangeText={setInputUrl}
                autoCapitalize="none"
                keyboardType="url"
                placeholder="http://192.168..."
            />
            
            <TouchableOpacity style={styles.button} onPress={() => {
                let finalUrl = inputUrl;
                if (!finalUrl.startsWith('http')) {
                    finalUrl = 'http://' + finalUrl;
                }
                setUrl(finalUrl);
                setIsConnected(true);
            }}>
                <Text style={styles.buttonText}>Conectar</Text>
            </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // WebView Screen
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <WebView 
        source={{ uri: url }}
        style={styles.webview}
        // Allow file access for Avatar uploads
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        startInLoadingState={true}
        onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
            // Optional: Alert the user or go back to config
            alert("Erro ao conectar. Verifique o IP e se o servidor está rodando.");
            setIsConnected(false);
        }}
      />
      
      {/* Hidden button in bottom right corner to reset IP config if needed */}
      <TouchableOpacity 
        style={styles.resetButton} 
        onLongPress={() => setIsConnected(false)}
        delayLongPress={1000}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  webview: {
    flex: 1,
  },
  configContainer: {
    flex: 1,
    backgroundColor: '#7c3aed', // Purple brand color
    justifyContent: 'center',
  },
  content: {
    backgroundColor: 'white',
    margin: 24,
    padding: 30,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    alignItems: 'center'
  },
  iconContainer: {
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 50,
    marginBottom: 20
  },
  icon: {
    fontSize: 40
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 20
  },
  hint: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 20,
    textAlign: 'center',
    fontStyle: 'italic'
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
    backgroundColor: '#f9fafb',
    color: '#1f2937'
  },
  button: {
    width: '100%',
    backgroundColor: '#7c3aed',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resetButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    zIndex: 100,
  }
});