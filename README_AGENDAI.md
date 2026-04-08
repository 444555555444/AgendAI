# AgendAI - Sistema de Agendamento Universal

Aplicativo mobile completo para gerenciamento de agendamentos, desenvolvido com React Native e Expo.

## 🚀 Recursos

- **Autenticação JWT** - Login seguro com refresh token
- **Dashboard** - Visualização de estatísticas e próximos agendamentos
- **Gerenciamento de Serviços** - Adicionar, editar e deletar serviços
- **Calendário de Disponibilidade** - Configurar horários de atendimento
- **Agendamentos** - Visualizar, filtrar e cancelar agendamentos
- **Integração com API** - Conectado ao backend AgendAI

## 📱 Tecnologias

- React Native
- Expo
- TypeScript
- React Navigation
- AsyncStorage
- Axios
- Context API

## 🔧 Instalação

```bash
npm install
```

## 🌐 Variáveis de Ambiente

Crie um arquivo `.env`:

```
EXPO_PUBLIC_API_URL=https://sua-api.com
EXPO_PUBLIC_APP_NAME=AgendAI
```

## 🏃 Executar

```bash
# Web
npm run web

# Android
npm run android

# iOS
npm run ios
```

## 📦 Build para Web

```bash
npx expo export --platform web
```

## 🌍 Deploy

O app está configurado para deploy em Vercel. Conecte seu repositório GitHub e o deploy será automático.

## 📝 Estrutura

```
src/
├── screens/       # Telas do app
├── services/      # Chamadas de API
├── context/       # Context API (Autenticação)
└── utils/         # Funções utilitárias
```

## 🔐 Autenticação

O app usa JWT com refresh token automático. Os tokens são armazenados em AsyncStorage.

## 📞 Suporte

Para suporte, entre em contato com o time de desenvolvimento.

---

**AgendAI** - Gerenciando agendamentos com inteligência ✨
