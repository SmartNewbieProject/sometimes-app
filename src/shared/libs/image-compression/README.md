# Image Compression Module

React Native + Expo 이미지 압축 모듈입니다. iOS, Android, Web 플랫폼을 지원합니다.

## 주요 기능

- ✅ **크로스 플랫폼 지원**: iOS, Android, Web
- ✅ **자동 리사이징**: 최대 2048px로 자동 조정
- ✅ **JPEG 압축**: 90% 품질 (설정 가능)
- ✅ **진행률 추적**: 실시간 압축 진행률 표시
- ✅ **자동 재시도**: 최대 3회 재시도
- ✅ **에러 처리**: 명확한 에러 메시지
- ✅ **다중 이미지 압축**: 여러 이미지 동시 처리
- ✅ **TypeScript 지원**: 완전한 타입 안전성

## 설치

이미 설치된 패키지:
- `expo-image-manipulator` (iOS/Android)
- `expo-file-system` (iOS/Android)

## 사용법

### 기본 사용법

```typescript
import { useImageCompression } from '@/src/shared/libs/image-compression';

function MyComponent() {
  const { compress, isCompressing, progress } = useImageCompression();

  const handleImagePick = async (uri: string) => {
    try {
      const result = await compress(uri, {
        maxDimension: 2048,
        quality: 0.9,
        outputFormat: 'jpeg',
      });

      console.log('압축 완료:', result);
      // result.uri - 압축된 이미지 URI
      // result.sizeInBytes - 압축된 파일 크기
      // result.width, result.height - 압축된 이미지 크기
    } catch (error) {
      console.error('압축 실패:', error);
    }
  };

  return (
    <>
      {/* Your UI */}
      {isCompressing && <Text>압축 중... {progress}%</Text>}
    </>
  );
}
```

### 진행률 UI와 함께 사용

```typescript
import { useImageCompression } from '@/src/shared/libs/image-compression';
import { ImageCompressionProgress } from '@/src/shared/ui/image-compression-progress';

function ProfileImageUpload() {
  const { compress, isCompressing, progress } = useImageCompression();

  const handleUpload = async (uri: string) => {
    const compressed = await compress(uri);
    // 서버에 업로드
    await uploadToServer(compressed.uri);
  };

  return (
    <>
      {/* Your component */}
      <ImageCompressionProgress
        visible={isCompressing}
        progress={progress}
      />
    </>
  );
}
```

### 다중 이미지 압축

```typescript
import { useImageCompression } from '@/src/shared/libs/image-compression';

function MultiImageUpload() {
  const { compressMultiple, isCompressing, progress } = useImageCompression();

  const handleMultipleImages = async (uris: string[]) => {
    try {
      const results = await compressMultiple(uris, {
        maxDimension: 2048,
        quality: 0.9,
      });

      console.log(`${results.length}개 이미지 압축 완료`);
      // 서버에 업로드
      await uploadMultiple(results.map(r => r.uri));
    } catch (error) {
      console.error('다중 압축 실패:', error);
    }
  };

  return (
    <>
      {/* Your UI */}
      <ImageCompressionProgress
        visible={isCompressing}
        progress={progress}
        currentImage={Math.ceil(progress / (100 / uris.length))}
        totalImages={uris.length}
      />
    </>
  );
}
```

### Base64 변환

```typescript
import { useImageCompression } from '@/src/shared/libs/image-compression';

function Base64Example() {
  const { compressToBase64 } = useImageCompression();

  const handleCompress = async (uri: string) => {
    const base64 = await compressToBase64(uri);
    // data:image/jpeg;base64,/9j/4AAQSkZJRg...
  };
}
```

### 프리셋 설정 사용

```typescript
import {
  useImageCompression,
  PROFILE_IMAGE_CONFIG,
  CHAT_IMAGE_CONFIG,
  ARTICLE_IMAGE_CONFIG,
} from '@/src/shared/libs/image-compression';

function ProfileUpload() {
  const { compress } = useImageCompression();

  const handleUpload = async (uri: string) => {
    // 프로필 이미지용 설정 (2048px, 90% 품질)
    const result = await compress(uri, PROFILE_IMAGE_CONFIG);
  };
}

function ChatImageUpload() {
  const { compress } = useImageCompression();

  const handleUpload = async (uri: string) => {
    // 채팅 이미지용 설정 (1920px, 85% 품질)
    const result = await compress(uri, CHAT_IMAGE_CONFIG);
  };
}
```

### 에러 처리

```typescript
import {
  useImageCompression,
  ImageCompressionError,
  ImageCompressionErrorCode,
  getErrorMessage,
} from '@/src/shared/libs/image-compression';
import { useModal } from '@/src/shared/hooks/use-modal';

function ErrorHandlingExample() {
  const { showModal } = useModal();
  const { compress } = useImageCompression({
    onError: (error) => {
      const message = getErrorMessage(error.code);
      showModal({
        title: '이미지 압축 실패',
        children: <Text>{message}</Text>,
        primaryButton: {
          text: '확인',
          onClick: () => {},
        },
      });
    },
  });

  const handleCompress = async (uri: string) => {
    try {
      const result = await compress(uri);
    } catch (error) {
      if (error instanceof ImageCompressionError) {
        switch (error.code) {
          case ImageCompressionErrorCode.INVALID_URI:
            console.error('잘못된 이미지 URI');
            break;
          case ImageCompressionErrorCode.FILE_TOO_LARGE:
            console.error('파일이 너무 큼');
            break;
          case ImageCompressionErrorCode.MAX_RETRIES_EXCEEDED:
            console.error('재시도 횟수 초과');
            break;
        }
      }
    }
  };
}
```

## API 레퍼런스

### `useImageCompression(options?)`

#### Parameters

- `options.onSuccess?: (result: ImageCompressionResult) => void` - 압축 성공 콜백
- `options.onError?: (error: ImageCompressionError) => void` - 에러 콜백

#### Returns

```typescript
{
  compress: (uri: string, options?: ImageCompressionOptions) => Promise<ImageCompressionResult>;
  compressToBase64: (uri: string, options?: ImageCompressionOptions) => Promise<string>;
  compressMultiple: (uris: string[], options?: ImageCompressionOptions) => Promise<ImageCompressionResult[]>;
  isCompressing: boolean;
  progress: number; // 0-100
  error: ImageCompressionError | null;
}
```

### `ImageCompressionOptions`

```typescript
{
  maxDimension?: number;        // 기본값: 2048
  quality?: number;             // 0-1, 기본값: 0.9
  outputFormat?: 'jpeg' | 'png'; // 기본값: 'jpeg'
  onProgress?: (progress: number) => void;
}
```

### `ImageCompressionResult`

```typescript
{
  uri: string;                  // 압축된 이미지 URI
  base64?: string;              // Base64 문자열 (web only)
  width: number;                // 압축 후 너비
  height: number;               // 압축 후 높이
  sizeInBytes: number;          // 압축 후 파일 크기
  mimeType: string;             // 'image/jpeg' 또는 'image/png'
}
```

## 성능 목표

| 플랫폼 | 타겟 시간 | 실제 성능 |
|--------|-----------|-----------|
| iPhone 14 Pro | < 0.8초 | TBD |
| iPhone 12 | < 1.2초 | TBD |
| iPhone SE 2 | < 2.5초 | TBD |
| Galaxy S23 | < 1.0초 | TBD |
| Galaxy S21 | < 1.5초 | TBD |
| Galaxy A32 | < 3.0초 | TBD |
| Web (Desktop) | < 0.5초 | TBD |

## 압축 사양

- **입력 포맷**: HEIC, PNG, JPEG, WebP
- **출력 포맷**: JPEG (기본)
- **최대 크기**: 2048×2048px
- **품질**: 90% (0.9)
- **목표 파일 크기**: 1-2MB (프로필 이미지)
- **압축률**: ~75% (6MB → 1.5MB)

## 에러 코드

| 코드 | 설명 | 사용자 메시지 |
|------|------|---------------|
| `INVALID_URI` | 잘못된 이미지 URI | 이미지를 찾을 수 없습니다. |
| `LOAD_FAILED` | 이미지 로드 실패 | 이미지를 불러올 수 없습니다. |
| `COMPRESSION_FAILED` | 압축 실패 | 이미지 처리 중 오류가 발생했습니다. |
| `MAX_RETRIES_EXCEEDED` | 재시도 횟수 초과 | 다른 사진을 선택해주세요. |
| `FILE_TOO_LARGE` | 파일 크기 초과 | 이미지 파일이 너무 큽니다. |
| `UNSUPPORTED_FORMAT` | 지원하지 않는 포맷 | 지원하지 않는 이미지 형식입니다. |

## 아키텍처

```
src/shared/libs/image-compression/
├── types.ts                    # 타입 정의
├── config.ts                   # 설정 및 상수
├── compressor.native.ts        # iOS/Android 구현 (expo-image-manipulator)
├── compressor.web.ts           # Web 구현 (Canvas API)
├── use-image-compression.ts    # React Hook
├── error-messages.ts           # 에러 메시지
├── index.ts                    # 진입점
└── README.md                   # 문서
```

## 통합 예시

### 회원가입 프로필 이미지

```typescript
// app/auth/signup/profile-image.tsx
import { useImageCompression, PROFILE_IMAGE_CONFIG } from '@/src/shared/libs/image-compression';
import { ImageCompressionProgress } from '@/src/shared/ui/image-compression-progress';

export function ProfileImageSignup() {
  const { compressMultiple, isCompressing, progress } = useImageCompression();

  const handleImageSelection = async (uris: string[]) => {
    try {
      const compressed = await compressMultiple(uris, PROFILE_IMAGE_CONFIG);

      // 서버 업로드
      await signupMutation.mutateAsync({
        profileImages: compressed.map(r => r.uri),
      });
    } catch (error) {
      // 에러 처리
    }
  };

  return (
    <>
      {/* Your UI */}
      <ImageCompressionProgress
        visible={isCompressing}
        progress={progress}
      />
    </>
  );
}
```

### 채팅 이미지 전송

```typescript
// src/features/chat/ui/chat-input.tsx
import { useImageCompression, CHAT_IMAGE_CONFIG } from '@/src/shared/libs/image-compression';

export function ChatInput() {
  const { compress, isCompressing } = useImageCompression();

  const handleImageSend = async (uri: string) => {
    const compressed = await compress(uri, CHAT_IMAGE_CONFIG);
    await sendChatImage(compressed.uri);
  };
}
```

## 마이그레이션 가이드

### 기존 코드

```typescript
// 기존
import { compressImage } from '@/src/features/chat/utils/image-compression';

const result = await compressImage(uri, { quality: 0.7 });
```

### 새 코드

```typescript
// 신규
import { useImageCompression } from '@/src/shared/libs/image-compression';

const { compress } = useImageCompression();
const result = await compress(uri, { quality: 0.9 });
```

## 테스트

```typescript
import { compressImage } from '@/src/shared/libs/image-compression';

describe('Image Compression', () => {
  it('should compress image', async () => {
    const result = await compressImage(testImageUri);

    expect(result.width).toBeLessThanOrEqual(2048);
    expect(result.height).toBeLessThanOrEqual(2048);
    expect(result.mimeType).toBe('image/jpeg');
  });

  it('should handle errors', async () => {
    await expect(compressImage('')).rejects.toThrow();
  });
});
```

## 성능 모니터링

압축 메트릭은 자동으로 로그에 기록됩니다:

```typescript
{
  originalSize: 6291456,          // 6MB
  compressedSize: 1572864,        // 1.5MB
  compressionRatio: 75,           // 75% 절감
  compressionTimeMs: 1200,        // 1.2초
  resized: true,
  originalDimensions: { width: 4032, height: 3024 },
  compressedDimensions: { width: 2048, height: 1536 }
}
```

## 라이센스

Internal use only - Sometimes Project
