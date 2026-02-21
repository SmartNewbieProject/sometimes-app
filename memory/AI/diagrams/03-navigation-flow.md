# Sometimes App - Navigation Flow

## Overview
File-based routing using Expo Router 6.x with React Navigation 7.x.

## Route Tree

```mermaid
flowchart TB
    subgraph Root["app/"]
        index["index.tsx (Splash)"]
        layout["_layout.tsx (Root)"]
        notfound["+not-found.tsx"]
        kakao["kakaolink.tsx"]
    end
    
    subgraph Auth["app/auth/"]
        login["login/index.tsx"]
        signup["signup/* (multi-step)"]
        jpSms["jp-sms/index.tsx"]
        approval["approval-*.tsx"]
    end
    
    subgraph Main["app/(tabs)/"]
        tabLayout["_layout.tsx"]
        homeTab["Home Tab"]
        matchTab["Match Tab"]
        chatTab["Chat Tab"]
        myTab["My Tab"]
    end
    
    subgraph Home["app/home/"]
        homeIndex["index.tsx"]
        matchResult["matching-result/"]
        myProfile["my-profile/"]
    end
    
    subgraph Chat["app/chat/"]
        chatIndex["index.tsx (list)"]
        chatRoom["[id].tsx (room)"]
    end
    
    subgraph Profile["Profile Routes"]
        profileView["profile/[id].tsx"]
        profileEdit["profile-edit/*"]
        myInfo["my-info/*"]
        my["my/*"]
    end
    
    subgraph Settings["Settings Routes"]
        setting["setting/*"]
        interest["interest/*"]
        partner["partner/*"]
    end
    
    subgraph Commerce["Commerce Routes"]
        purchase["purchase/*"]
        payment["payment/*"]
    end
    
    subgraph Social["Social Routes"]
        community["community/*"]
        moment["moment/*"]
        notification["notification/"]
        likeLetter["like-letter/"]
        matchHistory["matching-history/"]
    end
    
    Root --> Auth
    Root --> Main
    Main --> Home
    Main --> Chat
    Main --> Profile
    Main --> Settings
    Main --> Commerce
    Main --> Social
```

## Navigation Stack

```mermaid
flowchart TB
    subgraph RootNav["Root Navigator"]
        subgraph Stack["Stack Navigator"]
            Splash["Splash Screen"]
            Auth["Auth Stack"]
            MainTabs["Tab Navigator"]
            Modals["Modal Screens"]
        end
    end
    
    subgraph AuthStack["Auth Stack"]
        Login["Login"]
        Signup["Signup Flow"]
        JpSms["JP SMS Verify"]
        Onboarding["Onboarding"]
    end
    
    subgraph TabNav["Tab Navigator"]
        HomeStack["Home Stack"]
        MatchStack["Match Stack"]
        ChatStack["Chat Stack"]
        MyStack["My Stack"]
    end
    
    Splash --> |"Logged in"| MainTabs
    Splash --> |"Not logged in"| Auth
    Auth --> AuthStack
    MainTabs --> TabNav
```

## Signup Flow (Multi-step)

```mermaid
flowchart LR
    subgraph SignupFlow["Signup Steps"]
        S1["1. Phone"]
        S2["2. Basic Info"]
        S3["3. Profile Photo"]
        S4["4. University"]
        S5["5. Interests"]
        S6["6. Preferences"]
        S7["7. Complete"]
    end
    
    S1 --> S2 --> S3 --> S4 --> S5 --> S6 --> S7
```

## Interest Selection Flow

```mermaid
flowchart LR
    subgraph InterestFlow["Interest Steps"]
        I1["index.tsx"]
        I2["age.tsx"]
        I3["smoking.tsx"]
        I4["drinking.tsx"]
        I5["military.tsx"]
        I6["personality.tsx"]
        I7["like-mbti.tsx"]
        I8["bad-mbti.tsx"]
        I9["tattoo.tsx"]
        I10["done.tsx"]
    end
    
    I1 --> I2 --> I3 --> I4 --> I5 --> I6 --> I7 --> I8 --> I9 --> I10
```

## Moment Feature Routes

```mermaid
flowchart TB
    subgraph MomentRoutes["app/moment/"]
        momentIndex["index.tsx"]
        dailyRoulette["daily-roulette.tsx"]
        questionDetail["question-detail.tsx"]
        myMoment["my-moment.tsx"]
        myAnswers["my-answers.tsx"]
        myRecord["my-moment-record.tsx"]
        weeklyReport["weekly-report.tsx"]
        momentReport["moment-report.tsx"]
    end
    
    momentIndex --> dailyRoulette
    momentIndex --> questionDetail
    momentIndex --> myMoment
    myMoment --> myAnswers
    myMoment --> myRecord
    momentIndex --> weeklyReport
    momentIndex --> momentReport
```

## Deep Link Structure

```mermaid
flowchart TB
    subgraph DeepLinks["Deep Link Patterns"]
        home["sometimes://home"]
        profile["sometimes://profile/:id"]
        chat["sometimes://chat/:roomId"]
        match["sometimes://match/:matchId"]
        moment["sometimes://moment/:questionId"]
        payment["sometimes://payment/purchase"]
        event["sometimes://event/:eventId"]
    end
```

## Route Protection

```mermaid
flowchart TB
    subgraph RouteGuard["Route Protection"]
        Request["Navigation Request"]
        Check["Check Auth State"]
        
        subgraph Public["Public Routes"]
            Login["Login"]
            Signup["Signup"]
            Landing["Landing"]
        end
        
        subgraph Protected["Protected Routes"]
            Home["Home"]
            Profile["Profile"]
            Chat["Chat"]
            Match["Match"]
            Payment["Payment"]
        end
        
        Modal["Login Required Modal"]
    end
    
    Request --> Check
    Check --> |"No auth needed"| Public
    Check --> |"Auth exists"| Protected
    Check --> |"Auth required, missing"| Modal
    Modal --> Login
```

## Tab Bar Configuration

| Tab | Icon | Route | Badge |
|-----|------|-------|-------|
| Home | house | /(tabs)/home | - |
| Match | heart | /(tabs)/match | Match count |
| Chat | message | /(tabs)/chat | Unread count |
| My | person | /(tabs)/my | - |

## Route File Naming Rules

| Pattern | Purpose | Example |
|---------|---------|---------|
| `index.tsx` | Default route | `chat/index.tsx` → `/chat` |
| `[param].tsx` | Dynamic route | `chat/[id].tsx` → `/chat/123` |
| `_layout.tsx` | Layout wrapper | Wraps child routes |
| `+not-found.tsx` | 404 page | Catch-all |
| `_*.tsx` | Private file | Not a route |
