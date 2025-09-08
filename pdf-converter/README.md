# 📄 Conversor de PDF - App Expo

Um aplicativo simples e intuitivo para converter arquivos e fotos em PDF, especialmente desenvolvido para ser fácil de usar por idosos.

## ✨ Características

- **Interface Simples**: Design limpo e intuitivo com botões grandes
- **Sem Login**: Funciona imediatamente, sem necessidade de cadastro
- **Fácil de Usar**: Instruções claras e feedback visual
- **Múltiplos Formatos**: Suporta fotos, documentos e outros arquivos
- **Compartilhamento**: Salve ou compartilhe os PDFs gerados

## 🚀 Como Executar

### Pré-requisitos
- Node.js instalado
- Expo CLI instalado (`npm install -g @expo/cli`)
- App Expo Go no seu celular (disponível na App Store/Google Play)

### Instalação e Execução

1. **Navegue para o diretório do projeto:**
   ```bash
   cd pdf-converter
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm start
   ```

4. **Execute no seu dispositivo:**
   - Escaneie o QR code com o app Expo Go
   - Ou pressione `a` para Android ou `i` para iOS (se tiver emulador)

## 📱 Como Usar o App

1. **Escolher Arquivo**: Toque para selecionar qualquer arquivo do seu dispositivo
2. **Escolher Foto**: Toque para selecionar uma foto da galeria
3. **Converter**: Toque em "Converter para PDF" para gerar o PDF
4. **Salvar/Compartilhar**: Toque para salvar ou compartilhar o PDF gerado

## 🛠️ Tecnologias Utilizadas

- **Expo**: Framework para desenvolvimento React Native
- **React Native**: Framework para desenvolvimento mobile
- **expo-document-picker**: Para seleção de arquivos
- **expo-image-picker**: Para seleção de imagens
- **expo-print**: Para geração de PDFs
- **expo-sharing**: Para compartilhamento de arquivos

## 📦 Build para Produção

### Android (APK)
```bash
expo build:android
```

### iOS (IPA)
```bash
expo build:ios
```

### Web
```bash
expo build:web
```

## 🎯 Funcionalidades

- ✅ Seleção de arquivos do dispositivo
- ✅ Seleção de fotos da galeria
- ✅ Conversão de imagens para PDF
- ✅ Conversão de documentos para PDF
- ✅ Compartilhamento de PDFs
- ✅ Interface otimizada para idosos
- ✅ Feedback visual claro
- ✅ Instruções passo a passo

## 🔧 Configuração

O app está configurado para funcionar em:
- **Android**: Com permissões para armazenamento e câmera
- **iOS**: Com suporte a iPad
- **Web**: Versão web disponível

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

---

**Desenvolvido com ❤️ para ser simples e prático!**