#!/bin/bash

echo "🚀 Instalando PDF Simples..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js primeiro."
    echo "Visite: https://nodejs.org/"
    exit 1
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Por favor, instale npm primeiro."
    exit 1
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Verificar se Expo CLI está instalado globalmente
if ! command -v expo &> /dev/null; then
    echo "📱 Instalando Expo CLI..."
    npm install -g @expo/cli
fi

echo "✅ Instalação concluída!"
echo ""
echo "🎉 Para executar o app:"
echo "   npm start        # Abrir menu do Expo"
echo "   npm run android  # Executar no Android"
echo "   npm run ios      # Executar no iOS"
echo "   npm run web      # Executar na web"
echo ""
echo "📱 PDF Simples está pronto para uso!"