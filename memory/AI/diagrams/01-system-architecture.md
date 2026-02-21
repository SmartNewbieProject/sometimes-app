# Sometimes App - System Architecture

## Overview
React Native + Expo mobile application for university student social matching.

## C4 Context Diagram

```mermaid
C4Context
    title Sometimes App - System Context
    
    Person(user, "University Student", "Uses the app for social matching")
    
    System(app, "Sometimes App", "React Native/Expo mobile application")
    
    System_Ext(api, "Sometimes API", "NestJS backend server")
    System_Ext(mixpanel, "Mixpanel", "Analytics")
    System_Ext(sentry, "Sentry", "Error tracking")
    System_Ext(kakao, "Kakao SDK", "Social login & sharing")
    System_Ext(apple, "Apple Auth", "Apple Sign-In")
    System_Ext(portone, "Portone", "Payment processing")
    System_Ext(firebase, "Firebase", "Push notifications")
    
    Rel(user, app, "Uses")
    Rel(app, api, "REST API", "HTTPS")
    Rel(app, mixpanel, "Events", "HTTPS")
    Rel(app, sentry, "Errors", "HTTPS")
    Rel(app, kakao, "OAuth/Share", "SDK")
    Rel(app, apple, "OAuth", "SDK")
    Rel(app, portone, "Payment", "SDK")
    Rel(app, firebase, "Push", "SDK")
```

## Tech Stack

```mermaid
mindmap
    root((Sometimes App))
        Framework
            Expo 54
            React Native 0.81
            TypeScript 5.9
        State Management
            Zustand 5.x
            TanStack Query 5.x
            AsyncStorage
        Navigation
            Expo Router 6.x
            React Navigation 7.x
        UI/Animation
            StyleSheet
            Reanimated 4.x
            Lottie
            Flash List
        Forms
            React Hook Form 7.x
            Zod 3.x
        Communication
            Axios
            Socket.io Client
            Gifted Chat
        Analytics
            Mixpanel
            Sentry
            Hotjar
        Payment
            Portone SDK
            Expo IAP
        Social
            Kakao SDK
            Apple Auth
            Facebook SDK
```

## FSD Architecture Layers

```mermaid
flowchart TB
    subgraph App["app/ (Expo Router)"]
        Routes["File-based Routes"]
        Layouts["_layout.tsx files"]
    end
    
    subgraph Features["src/features/ (47 modules)"]
        Auth["auth, signup, jp-auth"]
        Matching["matching, match, idle-match-timer"]
        Chat["chat, notification, like-letter"]
        Profile["profile, profile-edit, my-info"]
        Payment["payment, pass"]
        Social["community, moment, somemate"]
        Other["home, setting, event, ..."]
    end
    
    subgraph Widgets["src/widgets/ (20 composites)"]
        Forms["Form widgets"]
        Cards["Photo cards, MBTI cards"]
        Selectors["Chip, MBTI selectors"]
    end
    
    subgraph Shared["src/shared/"]
        UI["ui/ (52 components)"]
        Hooks["hooks/ (32 hooks)"]
        Libs["libs/ (35+ utilities)"]
        Providers["providers/ (3 contexts)"]
        Config["config/, constants/"]
    end
    
    App --> Features
    Features --> Widgets
    Features --> Shared
    Widgets --> Shared
```

## Feature Module Structure

```mermaid
flowchart LR
    subgraph Feature["feature/{name}/"]
        APIs["apis/"]
        Hooks["hooks/"]
        Queries["queries/"]
        Services["services/"]
        Store["store/"]
        UI["ui/"]
        Types["types.ts"]
        Index["index.ts"]
    end
    
    APIs --> |"axios calls"| Backend[(API Server)]
    Queries --> |"TanStack Query"| APIs
    Hooks --> Queries
    Hooks --> Store
    UI --> Hooks
    Services --> APIs
```

## Data Flow

```mermaid
flowchart LR
    subgraph External
        API[(Sometimes API)]
        WS[WebSocket]
    end
    
    subgraph DataLayer["Data Layer"]
        Axios[axiosClient]
        Socket[socket.io]
    end
    
    subgraph QueryLayer["Query Layer"]
        TQ[TanStack Query]
        Cache[(Query Cache)]
    end
    
    subgraph StateLayer["State Layer"]
        Zustand[Zustand Stores]
        Storage[(AsyncStorage)]
    end
    
    subgraph UILayer["UI Layer"]
        Hooks[Custom Hooks]
        Components[React Components]
    end
    
    API <--> Axios
    WS <--> Socket
    Axios --> TQ
    TQ <--> Cache
    Socket --> Zustand
    TQ --> Hooks
    Zustand --> Hooks
    Zustand <--> Storage
    Hooks --> Components
```

## Provider Stack

```mermaid
flowchart TB
    subgraph Root["Root Layout (_layout.tsx)"]
        Sentry["Sentry.wrap()"]
        I18n["I18nextProvider"]
        Gesture["GestureHandlerRootView"]
        Query["QueryProvider"]
        Analytics["AnalyticsProvider (Mixpanel)"]
        Modal["ModalProvider"]
        Portone["PortoneProvider"]
        ChatProvider["GlobalChatProvider"]
        
        subgraph Utilities["Utility Components"]
            Session["SessionTracker"]
            Badge["AppBadgeSync"]
            Login["LoginRequiredModalListener"]
            Version["VersionUpdateChecker"]
            ChatActivity["ChatActivityTracker"]
            Logger["LoggerContainer"]
            Toast["Toast"]
        end
    end
    
    Sentry --> I18n --> Gesture --> Query --> Analytics --> Modal --> Portone --> ChatProvider --> Utilities
```

## Key Integration Points

| Integration | Library | Purpose |
|-------------|---------|---------|
| HTTP Client | axios + interceptors | API calls with token refresh |
| Real-time | socket.io-client | Chat messaging |
| State | Zustand | Global state (matching, chat, notifications) |
| Server State | TanStack Query | Caching, sync, pagination |
| Forms | react-hook-form + zod | Validation, submission |
| Analytics | Mixpanel | User behavior tracking |
| Errors | Sentry | Crash reporting |
| Push | expo-notifications + FCM | Push notifications |
| Payments | Portone + Expo IAP | In-app purchases |
