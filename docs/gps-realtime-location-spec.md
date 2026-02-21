# GPS 실시간 위치 추적 기술 명세서

> **작성일**: 2025-01-28
> **목적**: 근처 유저 검색/매칭, 위치 기반 콘텐츠/추천
> **추적 범위**: Foreground Only (앱 사용 중)
> **예상 규모**: 소규모 (1,000명 미만)

---

## 1. 개요

### 1.1 기능 목표
- 사용자의 실시간 위치를 기반으로 근처 유저 검색 및 매칭
- 현재 위치에 맞는 장소/이벤트 콘텐츠 추천
- 배터리 효율성과 정확도의 균형 유지

### 1.2 기술 스택
| 영역 | 기술 |
|------|------|
| Mobile | Expo SDK 54, expo-location |
| Protocol | HTTP/REST (polling) |
| Server | 기존 백엔드 API 확장 |
| Database | PostgreSQL + PostGIS 또는 Redis GEO |

---

## 2. 클라이언트 구현 (Expo)

### 2.1 패키지 설치

```bash
npx expo install expo-location
```

### 2.2 app.json 설정

```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "앱에서 근처 유저를 찾고 위치 기반 추천을 제공하기 위해 위치 정보가 필요합니다.",
          "locationAlwaysPermission": "백그라운드에서도 위치 기반 서비스를 제공합니다.",
          "locationWhenInUsePermission": "앱 사용 중 근처 유저를 찾기 위해 위치 정보가 필요합니다."
        }
      ]
    ]
  }
}
```

### 2.3 Accuracy 옵션 비교

| 옵션 | 정확도 | 배터리 소모 | 권장 용도 |
|------|--------|------------|----------|
| `Lowest` | ~3km | 최소 | 도시 수준 (사용 안 함) |
| `Low` | ~1km | 낮음 | 지역 수준 |
| **`Balanced`** | ~100m | 중간 | **근처 유저 검색 (권장)** |
| `High` | ~10m | 높음 | 정밀 추적 |
| `BestForNavigation` | ~5m | 최대 | 내비게이션 |

### 2.4 핵심 Hook 구현

```typescript
// src/features/location/hooks/use-location-tracking.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { AppState, AppStateStatus } from 'react-native';

interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
}

interface UseLocationTrackingOptions {
  /** 업데이트 주기 (ms) - 기본 30초 */
  timeInterval?: number;
  /** 거리 임계값 (m) - 기본 100m */
  distanceInterval?: number;
  /** 정확도 수준 */
  accuracy?: Location.Accuracy;
  /** 위치 변경 콜백 */
  onLocationChange?: (coords: LocationCoords) => void;
  /** 자동 시작 여부 */
  autoStart?: boolean;
}

const DEFAULT_OPTIONS: Required<Omit<UseLocationTrackingOptions, 'onLocationChange'>> = {
  timeInterval: 30000,      // 30초
  distanceInterval: 100,    // 100m
  accuracy: Location.Accuracy.Balanced,
  autoStart: false,
};

export function useLocationTracking(options: UseLocationTrackingOptions = {}) {
  const {
    timeInterval,
    distanceInterval,
    accuracy,
    onLocationChange,
    autoStart,
  } = { ...DEFAULT_OPTIONS, ...options };

  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // 권한 요청
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status !== 'granted') {
        setError('위치 권한이 거부되었습니다.');
        return false;
      }

      setError(null);
      return true;
    } catch (err) {
      setError('권한 요청 중 오류가 발생했습니다.');
      return false;
    }
  }, []);

  // 현재 위치 1회 조회
  const getCurrentLocation = useCallback(async (): Promise<LocationCoords | null> => {
    try {
      const hasPermission = permissionStatus === 'granted' || await requestPermission();
      if (!hasPermission) return null;

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy,
      });

      const coords: LocationCoords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        accuracy: currentLocation.coords.accuracy,
        timestamp: currentLocation.timestamp,
      };

      setLocation(coords);
      return coords;
    } catch (err) {
      setError('현재 위치를 가져올 수 없습니다.');
      return null;
    }
  }, [accuracy, permissionStatus, requestPermission]);

  // 추적 시작
  const startTracking = useCallback(async (): Promise<boolean> => {
    if (isTracking) return true;

    try {
      const hasPermission = permissionStatus === 'granted' || await requestPermission();
      if (!hasPermission) return false;

      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy,
          timeInterval,
          distanceInterval,
        },
        (newLocation) => {
          const coords: LocationCoords = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            accuracy: newLocation.coords.accuracy,
            timestamp: newLocation.timestamp,
          };

          setLocation(coords);
          onLocationChange?.(coords);
        }
      );

      setIsTracking(true);
      setError(null);
      return true;
    } catch (err) {
      setError('위치 추적을 시작할 수 없습니다.');
      return false;
    }
  }, [accuracy, distanceInterval, isTracking, onLocationChange, permissionStatus, requestPermission, timeInterval]);

  // 추적 중지
  const stopTracking = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    setIsTracking(false);
  }, []);

  // AppState 변경 감지 (백그라운드 진입 시 추적 중지)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appStateRef.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        // 백그라운드 진입 시 추적 중지 (배터리 절약)
        stopTracking();
      } else if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // 포그라운드 복귀 시 자동 재시작 (필요 시)
        if (autoStart) {
          startTracking();
        }
      }
      appStateRef.current = nextAppState;
    });

    return () => subscription.remove();
  }, [autoStart, startTracking, stopTracking]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  // 자동 시작
  useEffect(() => {
    if (autoStart) {
      startTracking();
    }
  }, [autoStart, startTracking]);

  return {
    location,
    isTracking,
    permissionStatus,
    error,
    requestPermission,
    getCurrentLocation,
    startTracking,
    stopTracking,
  };
}
```

### 2.5 서버 전송 Hook

```typescript
// src/features/location/hooks/use-location-sync.ts
import { useCallback, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { axiosClient } from '@/src/shared/libs/axios-client';
import { useLocationTracking } from './use-location-tracking';

interface LocationSyncOptions {
  /** 서버 전송 최소 간격 (ms) - 기본 30초 */
  minSyncInterval?: number;
  /** 동기화 활성화 여부 */
  enabled?: boolean;
}

export function useLocationSync(options: LocationSyncOptions = {}) {
  const { minSyncInterval = 30000, enabled = true } = options;

  const lastSyncTimeRef = useRef<number>(0);

  const syncMutation = useMutation({
    mutationFn: async (coords: { latitude: number; longitude: number }) => {
      // axiosClient interceptor가 response.data.data 반환
      return axiosClient.patch('/users/me/location', {
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    },
  });

  const handleLocationChange = useCallback(
    (coords: { latitude: number; longitude: number; timestamp: number }) => {
      if (!enabled) return;

      const now = Date.now();
      const timeSinceLastSync = now - lastSyncTimeRef.current;

      // 최소 간격 확인
      if (timeSinceLastSync < minSyncInterval) return;

      lastSyncTimeRef.current = now;
      syncMutation.mutate({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    },
    [enabled, minSyncInterval, syncMutation]
  );

  const locationTracking = useLocationTracking({
    timeInterval: minSyncInterval,
    distanceInterval: 100,
    onLocationChange: handleLocationChange,
  });

  return {
    ...locationTracking,
    isSyncing: syncMutation.isPending,
    syncError: syncMutation.error,
  };
}
```

### 2.6 근처 유저 조회 Hook

```typescript
// src/features/location/hooks/use-nearby-users.ts
import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '@/src/shared/libs/axios-client';

interface NearbyUser {
  id: string;
  nickname: string;
  profileImage: string | null;
  distance: number; // meters
}

interface UseNearbyUsersOptions {
  latitude: number | null;
  longitude: number | null;
  radiusKm?: number;
  enabled?: boolean;
}

export function useNearbyUsers({
  latitude,
  longitude,
  radiusKm = 5,
  enabled = true,
}: UseNearbyUsersOptions) {
  return useQuery({
    queryKey: ['nearby-users', latitude, longitude, radiusKm],
    queryFn: async (): Promise<NearbyUser[]> => {
      if (!latitude || !longitude) return [];

      // axiosClient interceptor가 response.data.data 반환
      return axiosClient.get('/users/nearby', {
        params: {
          latitude,
          longitude,
          radius: radiusKm,
        },
      });
    },
    enabled: enabled && latitude !== null && longitude !== null,
    staleTime: 30000, // 30초간 캐시
    refetchInterval: 60000, // 1분마다 자동 갱신
  });
}
```

---

## 3. 서버 아키텍처

### 3.1 시스템 구조도

```
┌─────────────────────────────────────────────────────────────┐
│  Mobile App (Expo)                                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │ useLocationSync Hook                               │    │
│  │ - watchPositionAsync (30초/100m 간격)              │    │
│  │ - 위치 변경 시 서버 전송                           │    │
│  └────────────────────────────────────────────────────┘    │
│                         │                                   │
│          PATCH /users/me/location (30초마다)               │
│          GET /users/nearby?lat=...&lng=...&radius=...      │
└─────────────────────────│───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  API Server                                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Location Controller                                │    │
│  │ - PATCH /users/me/location (위치 업데이트)         │    │
│  │ - GET /users/nearby (근처 유저 검색)               │    │
│  │ - GET /places/nearby (근처 장소 검색)              │    │
│  └────────────────────────────────────────────────────┘    │
│                         │                                   │
│                         ▼                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Redis GEO (실시간 위치 캐시)                       │    │
│  │ - Key: users:locations                             │    │
│  │ - TTL: 5분 (비활성 유저 자동 제거)                 │    │
│  │ - GEOADD, GEORADIUS 명령어 사용                    │    │
│  └────────────────────────────────────────────────────┘    │
│                         │                                   │
│                         ▼                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │ PostgreSQL + PostGIS (영구 저장)                   │    │
│  │ - 위치 히스토리 (분석용)                           │    │
│  │ - 장소/이벤트 데이터                               │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 API 명세

#### 3.2.1 위치 업데이트

```
PATCH /users/me/location
```

**Request Body:**
```json
{
  "latitude": 37.5665,
  "longitude": 126.9780
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "updatedAt": "2025-01-28T10:30:00Z"
  }
}
```

#### 3.2.2 근처 유저 검색

```
GET /users/nearby?latitude={lat}&longitude={lng}&radius={km}
```

**Query Parameters:**
| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|------|-------|------|
| latitude | number | O | - | 위도 |
| longitude | number | O | - | 경도 |
| radius | number | X | 5 | 검색 반경 (km) |
| limit | number | X | 20 | 최대 결과 수 |

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user-123",
        "nickname": "사용자1",
        "profileImage": "https://...",
        "distance": 1.2,
        "lastActiveAt": "2025-01-28T10:25:00Z"
      }
    ],
    "total": 15
  }
}
```

### 3.3 Redis GEO 활용

```redis
# 위치 저장 (TTL 5분)
GEOADD users:locations 126.9780 37.5665 user:123
EXPIRE users:locations:user:123 300

# 반경 5km 내 유저 검색 (거리 포함)
GEORADIUS users:locations 126.9780 37.5665 5 km WITHDIST ASC COUNT 20

# 두 유저 간 거리 계산
GEODIST users:locations user:123 user:456 km
```

### 3.4 PostgreSQL + PostGIS (선택사항)

```sql
-- 위치 히스토리 테이블
CREATE TABLE user_location_history (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  accuracy FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 공간 인덱스
CREATE INDEX idx_user_location_history_location
ON user_location_history USING GIST(location);

-- 근처 유저 검색 쿼리
SELECT
  u.id,
  u.nickname,
  u.profile_image,
  ST_Distance(ul.location, ST_MakePoint($1, $2)::geography) / 1000 as distance_km
FROM users u
JOIN user_locations ul ON u.id = ul.user_id
WHERE ST_DWithin(
  ul.location,
  ST_MakePoint($1, $2)::geography,
  $3 * 1000  -- km to meters
)
AND ul.updated_at > NOW() - INTERVAL '5 minutes'
ORDER BY distance_km ASC
LIMIT $4;
```

---

## 4. 업데이트 주기 설계

### 4.1 주기 계산 근거

| 요소 | 값 | 근거 |
|------|-----|------|
| 평균 보행 속도 | ~5 km/h (~83m/분) | 일반적인 걸음 속도 |
| 근처 유저 검색 반경 | 5km | 도보 1시간 거리 |
| 의미 있는 위치 변화 | 100m | 한 블록 정도 이동 |

### 4.2 권장 설정

| 용도 | timeInterval | distanceInterval | 서버 동기화 |
|------|-------------|------------------|------------|
| **근처 유저 검색** | 30초 | 100m | 30초 |
| 위치 기반 콘텐츠 | 60초 | 200m | 60초 |
| 배터리 절약 모드 | 300초 | 500m | 300초 |

### 4.3 배터리 소모 예상

| GPS 간격 | 예상 지속 시간 | 비고 |
|---------|--------------|------|
| 5초 | 10-12시간 | 정밀 추적 |
| **30초** | **18-24시간** | **권장 (균형)** |
| 60초 | 24-30시간 | 콘텐츠 추천 |
| 5분 | 36-48시간 | 배터리 절약 |

> 4000mAh 배터리 기준, 앱 Foreground 사용 시

---

## 5. 에러 처리 및 UX

### 5.1 권한 처리 플로우

```
┌─────────────────┐
│  위치 기능 진입  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     아니오     ┌─────────────────┐
│  권한 확인      │──────────────▶│  권한 요청      │
│  (granted?)     │               │  설명 표시      │
└────────┬────────┘               └────────┬────────┘
         │ 예                              │
         ▼                                 ▼
┌─────────────────┐               ┌─────────────────┐
│  위치 추적 시작  │               │  사용자 응답    │
└─────────────────┘               └────────┬────────┘
                                           │
                          ┌────────────────┼────────────────┐
                          ▼                ▼                ▼
                   ┌──────────┐    ┌──────────┐    ┌──────────┐
                   │  허용    │    │  거부    │    │  다시묻지│
                   │          │    │          │    │  않기    │
                   └────┬─────┘    └────┬─────┘    └────┬─────┘
                        │               │               │
                        ▼               ▼               ▼
                   정상 진행       기능 제한      설정 안내
                                  안내 표시      모달 표시
```

### 5.2 에러 메시지

| 상황 | 메시지 | 액션 |
|------|--------|------|
| 권한 거부 | "위치 권한이 필요합니다" | 설정 이동 버튼 |
| GPS 꺼짐 | "위치 서비스를 켜주세요" | 설정 이동 버튼 |
| 네트워크 에러 | "위치 정보를 전송할 수 없습니다" | 자동 재시도 |
| 위치 가져오기 실패 | "현재 위치를 확인할 수 없습니다" | 재시도 버튼 |

### 5.3 권한 요청 최적 타이밍

```typescript
// 좋은 예: 실제 기능 사용 직전에 요청
const handleNearbyUsersPress = async () => {
  const hasPermission = await requestPermission();
  if (hasPermission) {
    navigation.navigate('NearbyUsers');
  }
};

// 나쁜 예: 앱 시작 시 무조건 요청 (피할 것)
useEffect(() => {
  requestPermission(); // ❌
}, []);
```

---

## 6. 프라이버시 및 보안

### 6.1 데이터 보호

| 항목 | 정책 |
|------|------|
| 위치 정밀도 | 100m 단위로 라운딩하여 저장 |
| 데이터 보관 | 실시간 캐시 5분, 히스토리 30일 |
| 접근 제어 | 본인 + 매칭된 상대방만 조회 가능 |
| 전송 암호화 | HTTPS 필수 |

### 6.2 사용자 설정

- [ ] 위치 공유 ON/OFF 토글
- [ ] 위치 정밀도 설정 (정확/대략적)
- [ ] 위치 공유 대상 설정 (모두/매칭된 사람만)
- [ ] 위치 히스토리 삭제 기능

---

## 7. 테스트 체크리스트

### 7.1 기능 테스트

- [ ] 권한 요청 → 허용 → 위치 표시
- [ ] 권한 요청 → 거부 → 안내 메시지
- [ ] 위치 변경 시 서버 동기화
- [ ] 근처 유저 목록 조회
- [ ] 백그라운드 진입 시 추적 중지
- [ ] 포그라운드 복귀 시 재시작

### 7.2 에지 케이스

- [ ] GPS 꺼진 상태
- [ ] 비행기 모드
- [ ] 네트워크 없음
- [ ] 위치 권한 "앱 사용 중만" 설정
- [ ] 배터리 절약 모드 활성화

### 7.3 성능 테스트

- [ ] 30초 간격 추적 시 배터리 소모 측정
- [ ] 동시 100명 근처 유저 검색 응답 시간
- [ ] Redis GEO 쿼리 성능 (< 50ms)

---

## 8. 구현 우선순위

### Phase 1: 기본 구현
1. `expo-location` 설정 및 권한 처리
2. `useLocationTracking` Hook 구현
3. 위치 업데이트 API 연동

### Phase 2: 근처 유저 기능
4. Redis GEO 기반 서버 구현
5. 근처 유저 검색 API
6. `useNearbyUsers` Hook 구현

### Phase 3: 최적화 및 UX
7. 배터리 최적화 (AppState 연동)
8. 에러 처리 및 UX 개선
9. 프라이버시 설정 UI

---

## 9. 참고 자료

- [expo-location 공식 문서](https://docs.expo.dev/versions/latest/sdk/location/)
- [Redis GEO 명령어](https://redis.io/commands/?group=geo)
- [PostGIS 공간 쿼리](https://postgis.net/docs/reference.html)
- 업계 사례: Uber/Zomato - 3초 간격 + WebSocket (대규모)
- 배터리 최적화: 30초 → 600% 개선 (5초 대비)
