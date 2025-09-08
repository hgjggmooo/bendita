import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
  ActivityIndicator,
  Linking,
  Animated,
  Easing,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Constantes para responsividade
const BREAKPOINTS = {
  small: 320,
  medium: 768,
  large: 1024,
};

const isSmallScreen = screenWidth < BREAKPOINTS.medium;
const isMediumScreen = screenWidth >= BREAKPOINTS.medium && screenWidth < BREAKPOINTS.large;
const isLargeScreen = screenWidth >= BREAKPOINTS.large;

// Tipos de arquivo suportados
const SUPPORTED_TYPES = [
  'image/*',
  'text/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export default function App() {
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Animação de entrada
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Função otimizada para seleção de documentos
  const pickDocument = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: SUPPORTED_TYPES,
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // Validação de tamanho (máximo 50MB)
        if (asset.size && asset.size > 50 * 1024 * 1024) {
          Alert.alert(
            'Arquivo muito grande! 📏',
            'Por favor, escolha um arquivo menor que 50MB.',
            [{ text: 'Entendi', style: 'default' }]
          );
          return;
        }

        setSelectedFile(result);
        
        // Feedback visual melhorado
        Alert.alert(
          'Arquivo Selecionado! ✅',
          `📁 ${asset.name}\n📊 ${formatFileSize(asset.size || 0)}\n\n✨ Pronto para converter!`,
          [{ text: 'Perfeito!', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Erro ao selecionar arquivo:', error);
      Alert.alert(
        'Ops! 😅',
        'Não conseguimos selecionar o arquivo. Vamos tentar novamente?',
        [{ text: 'Sim, vamos!', style: 'default' }]
      );
    }
  }, []);

  // Função para formatar tamanho do arquivo
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // Função otimizada para conversão de PDF
  const convertToPDF = useCallback(async () => {
    if (!selectedFile || selectedFile.canceled || !selectedFile.assets) {
      Alert.alert(
        'Atenção! 👀',
        'Primeiro selecione um arquivo para converter.',
        [{ text: 'Entendi', style: 'default' }]
      );
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      const asset = selectedFile.assets[0];
      let htmlContent = '';

      // Progresso: Lendo arquivo
      setProcessingProgress(25);

      // Geração de HTML otimizada baseada no tipo de arquivo
      if (asset.mimeType?.startsWith('image/')) {
        htmlContent = await generateImageHTML(asset);
      } else if (asset.mimeType?.startsWith('text/')) {
        htmlContent = await generateTextHTML(asset);
      } else {
        htmlContent = generateInfoHTML(asset);
      }

      // Progresso: Gerando PDF
      setProcessingProgress(75);

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
        width: 612, // A4 width in points
        height: 792, // A4 height in points
        margins: {
          left: 72,
          right: 72,
          top: 72,
          bottom: 72,
        },
      });

      // Progresso: Finalizando
      setProcessingProgress(100);

      // Compartilhamento com melhor UX
      if (await Sharing.isAvailableAsync()) {
        const fileName = `${asset.name.split('.')[0]}_convertido.pdf`;
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Salvar PDF',
          UTI: 'com.adobe.pdf',
        });
        
        Alert.alert(
          'Sucesso! 🎉',
          `PDF criado com perfeição!\n\n📄 ${fileName}\n\n✨ Salve ou compartilhe como desejar!`,
          [{ text: 'Excelente!', style: 'default' }]
        );
      } else {
        Alert.alert(
          'PDF Pronto! 📄',
          'Seu arquivo foi convertido com sucesso!',
          [{ text: 'Ótimo!', style: 'default' }]
        );
      }

    } catch (error) {
      console.error('Erro na conversão:', error);
      Alert.alert(
        'Oops! 🔧',
        'Algo deu errado na conversão. Que tal tentar novamente ou escolher outro arquivo?',
        [
          { text: 'Tentar Novamente', style: 'default' },
          { text: 'Escolher Outro', onPress: pickDocument, style: 'cancel' }
        ]
      );
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  }, [selectedFile, pickDocument]);

  // Função para gerar HTML de imagem
  const generateImageHTML = useCallback(async (asset: DocumentPicker.DocumentPickerAsset): Promise<string> => {
    const base64 = await FileSystem.readAsStringAsync(asset.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Imagem Convertida - PDF Simples</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              padding: 40px;
            }
            .container {
              background: white;
              border-radius: 20px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              padding: 40px;
              max-width: 100%;
              text-align: center;
            }
            .header {
              margin-bottom: 30px;
            }
            .title {
              color: #2c3e50;
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 10px;
            }
            .filename {
              color: #7f8c8d;
              font-size: 16px;
              font-weight: 500;
            }
            img { 
              max-width: 100%; 
              height: auto; 
              border-radius: 12px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.15);
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #ecf0f1;
              color: #95a5a6;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="title">📸 Imagem Convertida</h1>
              <p class="filename">${asset.name}</p>
            </div>
            <img src="data:${asset.mimeType};base64,${base64}" alt="Imagem convertida para PDF">
            <div class="footer">
              <p>Convertido com ❤️ pelo PDF Simples</p>
              <p>${new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }, []);

  // Função para gerar HTML de texto
  const generateTextHTML = useCallback(async (asset: DocumentPicker.DocumentPickerAsset): Promise<string> => {
    const textContent = await FileSystem.readAsStringAsync(asset.uri);
    const escapedContent = textContent
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Documento de Texto - PDF Simples</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Georgia', 'Times New Roman', serif;
              line-height: 1.8;
              color: #2c3e50;
              background: #ffffff;
              padding: 60px 80px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 50px;
              padding-bottom: 30px;
              border-bottom: 3px solid #3498db;
            }
            .title {
              color: #2c3e50;
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 15px;
            }
            .filename {
              color: #7f8c8d;
              font-size: 18px;
              font-style: italic;
            }
            .content {
              background: #fafbfc;
              padding: 40px;
              border-radius: 12px;
              border-left: 6px solid #3498db;
              font-size: 16px;
              line-height: 1.8;
              white-space: pre-wrap;
              word-wrap: break-word;
              font-family: 'Courier New', monospace;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              padding-top: 30px;
              border-top: 2px solid #ecf0f1;
              color: #95a5a6;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">📄 Documento de Texto</h1>
            <p class="filename">${asset.name}</p>
          </div>
          <div class="content">${escapedContent}</div>
          <div class="footer">
            <p>Convertido com ❤️ pelo PDF Simples</p>
            <p>${new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
        </body>
      </html>
    `;
  }, []);

  // Função para gerar HTML de informações
  const generateInfoHTML = useCallback((asset: DocumentPicker.DocumentPickerAsset): string => {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Informações do Arquivo - PDF Simples</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 40px;
            }
            .container {
              background: white;
              border-radius: 24px;
              box-shadow: 0 25px 50px rgba(0,0,0,0.2);
              padding: 50px;
              max-width: 600px;
              width: 100%;
              text-align: center;
            }
            .icon {
              font-size: 80px;
              margin-bottom: 30px;
            }
            .title {
              color: #2c3e50;
              font-size: 36px;
              font-weight: 800;
              margin-bottom: 40px;
            }
            .info-grid {
              display: grid;
              gap: 20px;
              margin-bottom: 40px;
            }
            .info-item {
              background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
              padding: 25px;
              border-radius: 16px;
              border-left: 6px solid #3498db;
            }
            .info-label {
              font-size: 14px;
              color: #7f8c8d;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 8px;
            }
            .info-value {
              font-size: 18px;
              color: #2c3e50;
              font-weight: 700;
            }
            .footer {
              padding-top: 30px;
              border-top: 2px solid #ecf0f1;
              color: #95a5a6;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">📁</div>
            <h1 class="title">Informações do Arquivo</h1>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Nome do Arquivo</div>
                <div class="info-value">${asset.name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Tamanho</div>
                <div class="info-value">${formatFileSize(asset.size || 0)}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Tipo</div>
                <div class="info-value">${asset.mimeType || 'Desconhecido'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Data de Conversão</div>
                <div class="info-value">${new Date().toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</div>
              </div>
            </div>
            <div class="footer">
              <p><strong>PDF Simples</strong> - Conversão profissional e fácil</p>
              <p>Convertido com ❤️ e tecnologia</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }, [formatFileSize]);

  // Função para limpar seleção
  const clearSelection = useCallback(() => {
    setSelectedFile(null);
    Alert.alert(
      'Limpo! ✨',
      'Agora você pode selecionar um novo arquivo.',
      [{ text: 'Perfeito!', style: 'default' }]
    );
  }, []);

  // Função para abrir LinkedIn
  const openLinkedIn = useCallback(() => {
    Linking.openURL('https://linkedin.com/in/devferreirag');
  }, []);

  // Estilos responsivos calculados
  const responsiveStyles = useMemo(() => {
    const baseFontSize = isSmallScreen ? 16 : isMediumScreen ? 18 : 20;
    const titleSize = isSmallScreen ? 28 : isMediumScreen ? 32 : 36;
    const buttonPadding = isSmallScreen ? 20 : 24;
    const containerPadding = isSmallScreen ? 16 : 20;

    return {
      baseFontSize,
      titleSize,
      buttonPadding,
      containerPadding,
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#f8f9fa" 
        translucent={false}
      />
      
      <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContainer, 
            { paddingHorizontal: responsiveStyles.containerPadding }
          ]}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Header Refinado */}
          <View style={styles.header}>
            <Text style={[styles.title, { fontSize: responsiveStyles.titleSize }]}>
              📄 PDF SIMPLES
            </Text>
            <Text style={[styles.subtitle, { fontSize: responsiveStyles.baseFontSize - 2 }]}>
              Conversor profissional e intuitivo
            </Text>
            <View style={styles.headerDivider} />
          </View>

          {/* Arquivo Selecionado - Melhorado */}
          {selectedFile && !selectedFile.canceled && selectedFile.assets && (
            <View style={styles.selectedFileContainer}>
              <View style={styles.selectedFileHeader}>
                <Text style={styles.selectedFileIcon}>✅</Text>
                <Text style={styles.selectedFileTitle}>Arquivo Selecionado</Text>
              </View>
              <View style={styles.selectedFileInfo}>
                <Text style={styles.selectedFileName} numberOfLines={2}>
                  {selectedFile.assets[0].name}
                </Text>
                <View style={styles.selectedFileDetails}>
                  <Text style={styles.selectedFileSize}>
                    📊 {formatFileSize(selectedFile.assets[0].size || 0)}
                  </Text>
                  <Text style={styles.selectedFileType}>
                    📋 {selectedFile.assets[0].mimeType?.split('/')[1]?.toUpperCase() || 'ARQUIVO'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Botões Principais - Refinados */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.primaryButton,
                { padding: responsiveStyles.buttonPadding },
                isProcessing && styles.buttonDisabled
              ]} 
              onPress={pickDocument}
              disabled={isProcessing}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonIcon}>📁</Text>
                <Text style={[styles.buttonText, { fontSize: responsiveStyles.baseFontSize + 2 }]}>
                  SELECIONAR ARQUIVO
                </Text>
                <Text style={styles.buttonSubtext}>
                  Imagens, textos, documentos e mais
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.button, 
                styles.convertButton,
                { padding: responsiveStyles.buttonPadding },
                (!selectedFile || selectedFile.canceled || isProcessing) && styles.buttonDisabled
              ]} 
              onPress={convertToPDF}
              disabled={!selectedFile || selectedFile.canceled || isProcessing}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                {isProcessing ? (
                  <>
                    <ActivityIndicator size="small" color="#ffffff" style={{ marginBottom: 8 }} />
                    <Text style={[styles.buttonText, { fontSize: responsiveStyles.baseFontSize + 2 }]}>
                      CONVERTENDO...
                    </Text>
                    <Text style={styles.buttonSubtext}>
                      {processingProgress}% concluído
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.buttonIcon}>🔄</Text>
                    <Text style={[styles.buttonText, { fontSize: responsiveStyles.baseFontSize + 2 }]}>
                      CONVERTER PARA PDF
                    </Text>
                    <Text style={styles.buttonSubtext}>
                      Transformar em PDF profissional
                    </Text>
                  </>
                )}
              </View>
            </TouchableOpacity>

            {selectedFile && !selectedFile.canceled && (
              <TouchableOpacity 
                style={[
                  styles.button, 
                  styles.clearButton,
                  { padding: responsiveStyles.buttonPadding - 4 },
                  isProcessing && styles.buttonDisabled
                ]} 
                onPress={clearSelection}
                disabled={isProcessing}
                activeOpacity={0.8}
              >
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonIcon}>🗑️</Text>
                  <Text style={[styles.clearButtonText, { fontSize: responsiveStyles.baseFontSize }]}>
                    LIMPAR SELEÇÃO
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Instruções Melhoradas */}
          <View style={styles.instructionsContainer}>
            <Text style={[styles.instructionsTitle, { fontSize: responsiveStyles.baseFontSize + 4 }]}>
              📋 Como usar
            </Text>
            <View style={styles.instructionsList}>
              {[
                { icon: '1️⃣', text: 'Toque em "SELECIONAR ARQUIVO"' },
                { icon: '2️⃣', text: 'Escolha sua imagem, texto ou documento' },
                { icon: '3️⃣', text: 'Toque em "CONVERTER PARA PDF"' },
                { icon: '4️⃣', text: 'Salve ou compartilhe seu PDF!' },
              ].map((instruction, index) => (
                <View key={index} style={styles.instructionItem}>
                  <Text style={styles.instructionIcon}>{instruction.icon}</Text>
                  <Text style={[styles.instructionText, { fontSize: responsiveStyles.baseFontSize - 1 }]}>
                    {instruction.text}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Assinatura do Desenvolvedor */}
          <View style={styles.developerSignature}>
            <View style={styles.signatureDivider} />
            <Text style={styles.signatureText}>
              Desenvolvido com ❤️ por
            </Text>
            <TouchableOpacity onPress={openLinkedIn} activeOpacity={0.7}>
              <Text style={styles.developerName}>
                Gabriel Ferreira
              </Text>
              <Text style={styles.linkedinText}>
                linkedin.com/in/devferreirag
              </Text>
            </TouchableOpacity>
            <Text style={styles.openSourceText}>
              Open Source • Gratuito • Sem Limitações
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  animatedContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
  },
  title: {
    fontWeight: '800',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#7f8c8d',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 20,
  },
  headerDivider: {
    width: 60,
    height: 4,
    backgroundColor: '#3498db',
    borderRadius: 2,
  },
  selectedFileContainer: {
    backgroundColor: '#e8f5e8',
    borderRadius: 16,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#27ae60',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#27ae60',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  selectedFileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27ae60',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  selectedFileIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  selectedFileTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  selectedFileInfo: {
    padding: 20,
  },
  selectedFileName: {
    fontSize: 18,
    color: '#2c3e50',
    marginBottom: 12,
    fontWeight: '700',
    lineHeight: 24,
  },
  selectedFileDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  selectedFileSize: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '600',
  },
  selectedFileType: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '600',
  },
  buttonsContainer: {
    gap: 20,
    marginBottom: 40,
  },
  button: {
    borderRadius: 20,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: '#3498db',
    borderWidth: 2,
    borderColor: '#2980b9',
  },
  convertButton: {
    backgroundColor: '#27ae60',
    borderWidth: 2,
    borderColor: '#229954',
  },
  clearButton: {
    backgroundColor: '#e74c3c',
    borderWidth: 2,
    borderColor: '#c0392b',
    minHeight: 80,
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
    borderColor: '#95a5a6',
  },
  buttonText: {
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  buttonSubtext: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.95,
    fontWeight: '500',
  },
  clearButtonText: {
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  instructionsContainer: {
    backgroundColor: '#ffffff',
    padding: 28,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 30,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  instructionsTitle: {
    fontWeight: '800',
    color: '#2c3e50',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  instructionsList: {
    gap: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  instructionIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
  },
  instructionText: {
    color: '#2c3e50',
    lineHeight: 22,
    fontWeight: '500',
    flex: 1,
  },
  developerSignature: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  signatureDivider: {
    width: 40,
    height: 2,
    backgroundColor: '#bdc3c7',
    marginBottom: 16,
    borderRadius: 1,
  },
  signatureText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
    fontWeight: '500',
  },
  developerName: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  linkedinText: {
    fontSize: 12,
    color: '#3498db',
    textAlign: 'center',
    marginBottom: 12,
    textDecorationLine: 'underline',
  },
  openSourceText: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});