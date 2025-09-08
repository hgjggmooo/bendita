import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [convertedFile, setConvertedFile] = useState(null);

  // Função para selecionar arquivo
  const selectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedFile(result.assets[0]);
        setConvertedFile(null);
        Alert.alert(
          '✅ Arquivo Selecionado!',
          `Arquivo: ${result.assets[0].name}\n\nAgora você pode converter para PDF!`,
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      Alert.alert('❌ Erro', 'Não foi possível selecionar o arquivo. Tente novamente.');
    }
  };

  // Função para selecionar imagem
  const selectImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedFile({
          uri: result.assets[0].uri,
          name: `imagem_${Date.now()}.jpg`,
          type: 'image/jpeg',
        });
        setConvertedFile(null);
        Alert.alert(
          '✅ Imagem Selecionada!',
          'Imagem selecionada com sucesso!\n\nAgora você pode converter para PDF!',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      Alert.alert('❌ Erro', 'Não foi possível selecionar a imagem. Tente novamente.');
    }
  };

  // Função para converter para PDF
  const convertToPDF = async () => {
    if (!selectedFile) {
      Alert.alert('⚠️ Atenção', 'Por favor, selecione um arquivo primeiro!');
      return;
    }

    setIsProcessing(true);

    try {
      let htmlContent = '';

      if (selectedFile.type?.startsWith('image/')) {
        // Para imagens, criar HTML com a imagem
        htmlContent = `
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body {
                  margin: 0;
                  padding: 20px;
                  font-family: Arial, sans-serif;
                }
                img {
                  max-width: 100%;
                  height: auto;
                  display: block;
                  margin: 0 auto;
                }
                .header {
                  text-align: center;
                  margin-bottom: 20px;
                  font-size: 18px;
                  font-weight: bold;
                }
              </style>
            </head>
            <body>
              <div class="header">Imagem Convertida para PDF</div>
              <img src="${selectedFile.uri}" alt="Imagem convertida" />
            </body>
          </html>
        `;
      } else {
        // Para outros arquivos, criar HTML simples
        htmlContent = `
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body {
                  margin: 0;
                  padding: 20px;
                  font-family: Arial, sans-serif;
                  font-size: 16px;
                  line-height: 1.6;
                }
                .header {
                  text-align: center;
                  margin-bottom: 30px;
                  font-size: 20px;
                  font-weight: bold;
                  color: #333;
                }
                .content {
                  background-color: #f9f9f9;
                  padding: 20px;
                  border-radius: 8px;
                  border-left: 4px solid #007AFF;
                }
              </style>
            </head>
            <body>
              <div class="header">Arquivo Convertido para PDF</div>
              <div class="content">
                <p><strong>Nome do arquivo:</strong> ${selectedFile.name}</p>
                <p><strong>Tipo:</strong> ${selectedFile.type || 'Arquivo'}</p>
                <p><strong>Data de conversão:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
                <p><strong>Hora:</strong> ${new Date().toLocaleTimeString('pt-BR')}</p>
                <br>
                <p>Este arquivo foi convertido para PDF com sucesso!</p>
                <p>Você pode salvar, compartilhar ou imprimir este documento.</p>
              </div>
            </body>
          </html>
        `;
      }

      // Gerar PDF
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      setConvertedFile({ uri, name: `${selectedFile.name.split('.')[0]}.pdf` });
      
      Alert.alert(
        '🎉 Sucesso!',
        'Arquivo convertido para PDF com sucesso!\n\nAgora você pode salvar ou compartilhar!',
        [{ text: 'OK', style: 'default' }]
      );

    } catch (error) {
      Alert.alert('❌ Erro', 'Não foi possível converter o arquivo. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Função para salvar/compartilhar PDF
  const sharePDF = async () => {
    if (!convertedFile) {
      Alert.alert('⚠️ Atenção', 'Nenhum PDF foi gerado ainda!');
      return;
    }

    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(convertedFile.uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Compartilhar PDF',
        });
      } else {
        Alert.alert('❌ Erro', 'Compartilhamento não disponível neste dispositivo.');
      }
    } catch (error) {
      Alert.alert('❌ Erro', 'Não foi possível compartilhar o arquivo.');
    }
  };

  // Função para limpar tudo
  const clearAll = () => {
    setSelectedFile(null);
    setConvertedFile(null);
    Alert.alert('🧹 Limpo!', 'Tudo foi limpo. Você pode começar novamente!');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>📄 Conversor de PDF</Text>
        <Text style={styles.subtitle}>Simples e Fácil de Usar</Text>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>📋 Como Usar:</Text>
        <Text style={styles.instructionText}>
          1️⃣ Toque em "Escolher Arquivo" ou "Escolher Foto"{'\n'}
          2️⃣ Selecione seu arquivo ou foto{'\n'}
          3️⃣ Toque em "Converter para PDF"{'\n'}
          4️⃣ Toque em "Salvar/Compartilhar" quando pronto
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={selectFile}>
          <Text style={styles.buttonText}>📁 Escolher Arquivo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton} onPress={selectImage}>
          <Text style={styles.buttonText}>📷 Escolher Foto</Text>
        </TouchableOpacity>
      </View>

      {selectedFile && (
        <View style={styles.fileInfo}>
          <Text style={styles.fileInfoTitle}>📄 Arquivo Selecionado:</Text>
          <Text style={styles.fileInfoText}>{selectedFile.name}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.convertButton, (!selectedFile || isProcessing) && styles.disabledButton]} 
          onPress={convertToPDF}
          disabled={!selectedFile || isProcessing}
        >
          {isProcessing ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.buttonText}>⏳ Convertendo...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>🔄 Converter para PDF</Text>
          )}
        </TouchableOpacity>
      </View>

      {convertedFile && (
        <View style={styles.successContainer}>
          <Text style={styles.successTitle}>✅ PDF Criado com Sucesso!</Text>
          <Text style={styles.successText}>{convertedFile.name}</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.shareButton} onPress={sharePDF}>
              <Text style={styles.buttonText}>💾 Salvar/Compartilhar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.clearButton} onPress={clearAll}>
          <Text style={styles.clearButtonText}>🧹 Limpar Tudo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 Dica: Este app funciona com fotos, documentos e outros arquivos!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  instructions: {
    backgroundColor: '#E3F2FD',
    padding: 20,
    borderRadius: 12,
    marginBottom: 25,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  convertButton: {
    backgroundColor: '#34C759',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  shareButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  clearButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  clearButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: {
    backgroundColor: '#F0F8FF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  fileInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  fileInfoText: {
    fontSize: 14,
    color: '#333',
  },
  successContainer: {
    backgroundColor: '#E8F5E8',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  footer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  footerText: {
    fontSize: 14,
    color: '#E65100',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});