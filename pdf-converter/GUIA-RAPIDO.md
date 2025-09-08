# 📱 PDF SIMPLES - Guia Rápido

## 🚀 Como executar o app AGORA

### 1. Abrir o terminal nesta pasta
```bash
cd pdf-converter
```

### 2. Instalar tudo automaticamente
```bash
./install.sh
```
*ou se não funcionar:*
```bash
npm install
```

### 3. Executar o app
```bash
npm start
```

### 4. Escolher onde executar
- **📱 No celular**: Escaneie o QR code com o app Expo Go
- **🌐 Na web**: Pressione `w` no terminal
- **📱 Android**: Pressione `a` no terminal (precisa do Android Studio)
- **📱 iOS**: Pressione `i` no terminal (precisa do Xcode - só no Mac)

---

## 🎯 Para PRODUÇÃO (APK/Store)

### 1. Instalar EAS CLI
```bash
npm install -g @expo/eas-cli
```

### 2. Fazer login
```bash
eas login
```

### 3. Gerar APK para Android
```bash
eas build --platform android --profile preview
```

### 4. Publicar na Store
```bash
eas build --platform android --profile production
eas submit --platform android
```

---

## ✨ O que o app faz

- ✅ **Simples**: Interface grande, botões claros
- ✅ **Rápido**: Converte arquivos em segundos
- ✅ **Prático**: Sem cadastro, sem complicação
- ✅ **Idosos**: Feito pensando na facilidade

### Tipos de arquivo suportados:
- 📸 **Imagens**: JPG, PNG, GIF, etc.
- 📄 **Textos**: TXT, DOC, DOCX
- 📋 **Outros**: Qualquer arquivo vira PDF

---

## 🆘 Problemas comuns

### "Command not found: npm"
- Instale Node.js: https://nodejs.org/

### "Command not found: expo"
```bash
npm install -g @expo/cli
```

### App não abre no celular
- Instale "Expo Go" na Play Store/App Store
- Conecte no mesmo WiFi do computador

### Erro ao converter PDF
- Arquivo muito grande? Tente um menor
- Formato não suportado? Use JPG/PNG/TXT

---

## 📞 Tudo pronto!

O app **PDF SIMPLES** está **100% funcional** e pronto para uso!

🎉 **Divirta-se convertendo PDFs!**