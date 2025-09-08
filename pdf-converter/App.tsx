import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function App() {
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setSelectedFile(result);
        Alert.alert(
          'Arquivo Selecionado! ✅',
          `${result.assets[0].name}\n\nAgora você pode converter para PDF!`,
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar o arquivo. Tente novamente.');
    }
  };

  const convertToPDF = async () => {
    if (!selectedFile || selectedFile.canceled) {
      Alert.alert('Atenção', 'Por favor, selecione um arquivo primeiro!');
      return;
    }

    setIsProcessing(true);

    try {
      const asset = selectedFile.assets[0];
      let htmlContent = '';

      // Se for uma imagem
      if (asset.mimeType?.startsWith('image/')) {
        const base64 = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        htmlContent = `
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { 
                  margin: 0; 
                  padding: 20px; 
                  display: flex; 
                  justify-content: center; 
                  align-items: center;
                  min-height: 100vh;
                }
                img { 
                  max-width: 100%; 
                  height: auto; 
                  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }
              </style>
            </head>
            <body>
              <img src="data:${asset.mimeType};base64,${base64}" alt="Imagem convertida">
            </body>
          </html>
        `;
      } else if (asset.mimeType?.startsWith('text/')) {
        // Se for texto
        const textContent = await FileSystem.readAsStringAsync(asset.uri);
        htmlContent = `
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  line-height: 1.6; 
                  margin: 40px; 
                  font-size: 16px;
                  color: #333;
                }
                pre { 
                  white-space: pre-wrap; 
                  word-wrap: break-word; 
                  background-color: #f5f5f5;
                  padding: 20px;
                  border-radius: 8px;
                  border-left: 4px solid #007AFF;
                }
              </style>
            </head>
            <body>
              <h2>📄 ${asset.name}</h2>
              <pre>${textContent}</pre>
            </body>
          </html>
        `;
      } else {
        // Para outros tipos de arquivo, criar um PDF com informações básicas
        htmlContent = `
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 40px; 
                  text-align: center;
                  color: #333;
                }
                .info-box {
                  background-color: #f0f8ff;
                  padding: 30px;
                  border-radius: 12px;
                  border: 2px solid #007AFF;
                  margin: 20px 0;
                }
                h1 { color: #007AFF; margin-bottom: 30px; }
                .detail { 
                  font-size: 18px; 
                  margin: 15px 0; 
                  padding: 10px;
                  background-color: white;
                  border-radius: 8px;
                }
              </style>
            </head>
            <body>
              <h1>📁 Informações do Arquivo</h1>
              <div class="info-box">
                <div class="detail"><strong>Nome:</strong> ${asset.name}</div>
                <div class="detail"><strong>Tamanho:</strong> ${(asset.size! / 1024).toFixed(2)} KB</div>
                <div class="detail"><strong>Tipo:</strong> ${asset.mimeType || 'Desconhecido'}</div>
                <div class="detail"><strong>Data de Conversão:</strong> ${new Date().toLocaleDateString('pt-BR')}</div>
              </div>
              <p style="margin-top: 40px; font-size: 16px; color: #666;">
                Este arquivo foi convertido para PDF usando o PDF SIMPLES
              </p>
            </body>
          </html>
        `;
      }

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      // Compartilhar o PDF gerado
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Salvar PDF',
        });
        
        Alert.alert(
          'Sucesso! 🎉',
          'PDF criado com sucesso!\n\nVocê pode salvar ou compartilhar o arquivo.',
          [{ text: 'Ótimo!', style: 'default' }]
        );
      } else {
        Alert.alert('PDF Criado', 'PDF foi gerado com sucesso!');
      }

    } catch (error) {
      console.error('Erro na conversão:', error);
      Alert.alert(
        'Erro na Conversão',
        'Não foi possível converter o arquivo. Tente novamente ou escolha outro arquivo.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    Alert.alert('Limpo! ✨', 'Você pode selecionar um novo arquivo agora.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📄 PDF SIMPLES</Text>
          <Text style={styles.subtitle}>Conversor fácil e prático</Text>
        </View>

        {/* Arquivo Selecionado */}
        {selectedFile && !selectedFile.canceled && (
          <View style={styles.selectedFileContainer}>
            <Text style={styles.selectedFileTitle}>✅ Arquivo Selecionado:</Text>
            <Text style={styles.selectedFileName}>{selectedFile.assets[0].name}</Text>
            <Text style={styles.selectedFileSize}>
              Tamanho: {(selectedFile.assets[0].size! / 1024).toFixed(2)} KB
            </Text>
          </View>
        )}

        {/* Botões Principais */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={pickDocument}
            disabled={isProcessing}
          >
            <Text style={styles.buttonText}>
              📁 SELECIONAR ARQUIVO
            </Text>
            <Text style={styles.buttonSubtext}>
              Escolha imagens, textos ou documentos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.button, 
              styles.convertButton,
              (!selectedFile || selectedFile.canceled || isProcessing) && styles.buttonDisabled
            ]} 
            onPress={convertToPDF}
            disabled={!selectedFile || selectedFile.canceled || isProcessing}
          >
            <Text style={[
              styles.buttonText,
              (!selectedFile || selectedFile.canceled || isProcessing) && styles.buttonTextDisabled
            ]}>
              {isProcessing ? '⏳ CONVERTENDO...' : '🔄 CONVERTER PARA PDF'}
            </Text>
            <Text style={[
              styles.buttonSubtext,
              (!selectedFile || selectedFile.canceled || isProcessing) && styles.buttonTextDisabled
            ]}>
              {isProcessing ? 'Aguarde um momento...' : 'Transformar em PDF'}
            </Text>
          </TouchableOpacity>

          {selectedFile && !selectedFile.canceled && (
            <TouchableOpacity 
              style={[styles.button, styles.clearButton]} 
              onPress={clearSelection}
              disabled={isProcessing}
            >
              <Text style={styles.clearButtonText}>
                🗑️ LIMPAR SELEÇÃO
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Instruções */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>📋 Como usar:</Text>
          <Text style={styles.instructionText}>1. Toque em "SELECIONAR ARQUIVO"</Text>
          <Text style={styles.instructionText}>2. Escolha uma imagem, texto ou documento</Text>
          <Text style={styles.instructionText}>3. Toque em "CONVERTER PARA PDF"</Text>
          <Text style={styles.instructionText}>4. Salve ou compartilhe seu PDF!</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  selectedFileContainer: {
    backgroundColor: '#e8f5e8',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#27ae60',
  },
  selectedFileTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 8,
  },
  selectedFileName: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 4,
    fontWeight: '600',
  },
  selectedFileSize: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  buttonsContainer: {
    gap: 20,
    marginBottom: 40,
  },
  button: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButton: {
    backgroundColor: '#3498db',
  },
  convertButton: {
    backgroundColor: '#27ae60',
  },
  clearButton: {
    backgroundColor: '#e74c3c',
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  buttonTextDisabled: {
    color: '#7f8c8d',
  },
  buttonSubtext: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
  },
  clearButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  instructionsContainer: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: '#5a6c7d',
    marginBottom: 8,
    paddingLeft: 8,
    lineHeight: 24,
  },
});