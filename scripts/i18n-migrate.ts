#!/usr/bin/env tsx
/**
 * i18n 마이그레이션 도구 - 자동 변환
 *
 * 사용법:
 *   npm run i18n:migrate -- <file-path> [--dry-run]
 *
 * 예시:
 *   npm run i18n:migrate -- src/features/auth/hooks/use-auth.tsx
 *   npm run i18n:migrate -- src/features/match/constants/miho-messages.ts --dry-run
 */

import * as fs from 'fs';
import * as path from 'path';

interface MigrationConfig {
  filePath: string;
  dryRun: boolean;
}

interface TranslationEntry {
  originalText: string;
  i18nKey: string;
  line: number;
  type: 'title' | 'string' | 'error' | 'modal';
}

interface MigrationResult {
  filePath: string;
  totalReplacements: number;
  entries: TranslationEntry[];
  updatedCode: string;
  jsonUpdates: {
    ko: Record<string, any>;
    ja: Record<string, any>;
    en: Record<string, any>;
  };
}

/**
 * 파일 경로에서 i18n JSON 경로 및 prefix 추출
 */
function getI18nPath(filePath: string): {
  layer: 'apps' | 'features' | 'widgets' | 'shareds';
  moduleName: string;
  jsonPath: string;
} {
  const normalized = filePath.replace(/\\/g, '/');

  if (normalized.startsWith('app/')) {
    const parts = normalized.split('/');
    const moduleName = parts[1]; // app/auth -> auth
    return {
      layer: 'apps',
      moduleName,
      jsonPath: `src/shared/libs/locales/{lang}/apps/${moduleName}.json`,
    };
  }

  if (normalized.includes('/features/')) {
    const match = normalized.match(/features\/([^\/]+)/);
    const moduleName = match ? match[1] : 'unknown';
    return {
      layer: 'features',
      moduleName,
      jsonPath: `src/shared/libs/locales/{lang}/features/${moduleName}.json`,
    };
  }

  if (normalized.includes('/widgets/')) {
    const match = normalized.match(/widgets\/([^\/]+)/);
    const moduleName = match ? match[1] : 'unknown';
    return {
      layer: 'widgets',
      moduleName,
      jsonPath: `src/shared/libs/locales/{lang}/widgets/${moduleName}.json`,
    };
  }

  if (normalized.includes('/shared/')) {
    const match = normalized.match(/shared\/([^\/]+)/);
    const moduleName = match ? match[1] : 'unknown';
    return {
      layer: 'shareds',
      moduleName,
      jsonPath: `src/shared/libs/locales/{lang}/shareds/${moduleName}.json`,
    };
  }

  return {
    layer: 'apps',
    moduleName: 'index',
    jsonPath: `src/shared/libs/locales/{lang}/apps/index.json`,
  };
}

/**
 * 한글 텍스트를 snake_case 키로 변환
 */
function textToKey(text: string): string {
  return text
    .slice(0, 30)
    .toLowerCase()
    .replace(/[^\w가-힣]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * i18n 키 생성
 */
function generateKey(
  layer: string,
  moduleName: string,
  context: string,
  text: string
): string {
  const textKey = textToKey(text);

  // 컨텍스트 기반 섹션 결정
  let section = 'common';

  if (context.includes('hook')) section = 'hooks';
  else if (context.includes('ui') || context.includes('component')) section = 'ui';
  else if (context.includes('modal')) section = 'modals';
  else if (context.includes('error')) section = 'errors';
  else if (context.includes('api')) section = 'apis';

  return `${layer}.${moduleName}.${section}.${textKey}`;
}

/**
 * 코드에서 한글 문자열 추출 및 변환
 */
function migrateFile(config: MigrationConfig): MigrationResult {
  const { filePath } = config;
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const { layer, moduleName, jsonPath } = getI18nPath(filePath);
  const entries: TranslationEntry[] = [];
  const jsonUpdates: MigrationResult['jsonUpdates'] = {
    ko: {},
    ja: {},
    en: {},
  };

  let updatedCode = content;
  let replacementCount = 0;

  // useTranslation import가 있는지 확인
  const hasUseTranslation = content.includes('useTranslation');
  const hasReactI18next = content.includes('react-i18next');

  // 1. 한글 문자열 찾기 및 변환
  const koreanPattern = /(['"`])([가-힣]+[가-힣\s!?.,()\/\-:]*?)\1/g;

  lines.forEach((line, lineIdx) => {
    // console.log, 주석 라인 제외
    if (
      line.includes('console.') ||
      line.trim().startsWith('//') ||
      line.trim().startsWith('/*') ||
      line.includes('t(') // 이미 번역된 것
    ) {
      return;
    }

    const matches = Array.from(line.matchAll(koreanPattern));

    matches.forEach((match) => {
      const originalText = match[2].trim();
      if (originalText.length < 2) return;

      // 파일 경로에서 컨텍스트 추출
      const fileContext = filePath.split('/').slice(-2, -1)[0] || 'common';

      // i18n 키 생성
      const fullKey = generateKey(layer, moduleName, fileContext, originalText);
      const shortKey = fullKey.replace(`${layer}.${moduleName}.`, '');

      entries.push({
        originalText,
        i18nKey: fullKey,
        line: lineIdx + 1,
        type: line.includes('title') ? 'title' : 'string',
      });

      // JSON 업데이트 준비
      const keyParts = shortKey.split('.');
      let koObj = jsonUpdates.ko;
      let jaObj = jsonUpdates.ja;
      let enObj = jsonUpdates.en;

      // 중첩 객체 생성
      for (let i = 0; i < keyParts.length - 1; i++) {
        const part = keyParts[i];
        if (!koObj[part]) koObj[part] = {};
        if (!jaObj[part]) jaObj[part] = {};
        if (!enObj[part]) enObj[part] = {};

        koObj = koObj[part];
        jaObj = jaObj[part];
        enObj = enObj[part];
      }

      const lastKey = keyParts[keyParts.length - 1];
      koObj[lastKey] = originalText;
      jaObj[lastKey] = `[JA] ${originalText}`; // 일본어 플레이스홀더
      enObj[lastKey] = `[EN] ${originalText}`; // 영어 플레이스홀더

      // 코드 변환: "한글" → t("key")
      const regex = new RegExp(
        `(['"\`])${originalText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\1`,
        'g'
      );
      updatedCode = updatedCode.replace(regex, `t("${shortKey}")`);
      replacementCount++;
    });
  });

  // 2. useTranslation import 추가 (필요시)
  if (entries.length > 0 && !hasUseTranslation) {
    const importStatement = hasReactI18next
      ? `const { t } = useTranslation();\n`
      : `import { useTranslation } from 'react-i18next';\n`;

    // 첫 번째 import 뒤에 추가
    const firstImportIndex = updatedCode.indexOf('import ');
    if (firstImportIndex !== -1) {
      const firstLineEnd = updatedCode.indexOf('\n', firstImportIndex);
      updatedCode =
        updatedCode.slice(0, firstLineEnd + 1) +
        (!hasReactI18next
          ? `import { useTranslation } from 'react-i18next';\n`
          : '') +
        updatedCode.slice(firstLineEnd + 1);
    }

    // 컴포넌트/훅 내부에 const { t } = useTranslation(); 추가
    // (함수형 컴포넌트의 경우)
    const functionMatch = updatedCode.match(
      /(export\s+(default\s+)?function|const\s+\w+\s*=\s*\([^)]*\)\s*=>)\s*\{/
    );

    if (functionMatch) {
      const insertPos = functionMatch.index! + functionMatch[0].length;
      updatedCode =
        updatedCode.slice(0, insertPos) +
        `\n  const { t } = useTranslation();\n` +
        updatedCode.slice(insertPos);
    }
  }

  return {
    filePath,
    totalReplacements: replacementCount,
    entries,
    updatedCode,
    jsonUpdates,
  };
}

/**
 * JSON 파일 업데이트
 */
function updateJSONFiles(
  jsonPath: string,
  updates: Record<string, any>,
  lang: string,
  dryRun: boolean
) {
  const actualPath = jsonPath.replace('{lang}', lang);

  let existing: Record<string, any> = {};

  if (fs.existsSync(actualPath)) {
    const content = fs.readFileSync(actualPath, 'utf-8');
    existing = JSON.parse(content);
  }

  // Deep merge
  const merged = deepMerge(existing, updates);

  if (!dryRun) {
    // 디렉터리 생성
    const dir = path.dirname(actualPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(actualPath, JSON.stringify(merged, null, 2), 'utf-8');
    console.log(`   ✅ ${lang.toUpperCase()}: ${actualPath}`);
  } else {
    console.log(`   📝 (DRY-RUN) ${lang.toUpperCase()}: ${actualPath}`);
  }
}

/**
 * Deep merge helper
 */
function deepMerge(target: any, source: any): any {
  const result = { ...target };

  for (const key in source) {
    if (
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      source[key] !== null
    ) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }

  return result;
}

/**
 * 결과 출력
 */
function printResult(result: MigrationResult, dryRun: boolean) {
  console.log(`\n📄 ${result.filePath}`);
  console.log(`   총 ${result.totalReplacements}개 문자열 변환\n`);

  if (result.entries.length === 0) {
    console.log('   ℹ️  변환할 한글 문자열이 없습니다.\n');
    return;
  }

  console.log('   변환 내역:');
  result.entries.slice(0, 10).forEach((entry, idx) => {
    console.log(`   ${idx + 1}. Line ${entry.line}`);
    console.log(`      "${entry.originalText}"`);
    console.log(`      → t("${entry.i18nKey.split('.').slice(2).join('.')}")`);
    console.log();
  });

  if (result.entries.length > 10) {
    console.log(`   ... 외 ${result.entries.length - 10}개 더\n`);
  }

  console.log('   JSON 업데이트:');
  const { layer, moduleName, jsonPath } = getI18nPath(result.filePath);
  ['ko', 'ja', 'en'].forEach((lang) => {
    updateJSONFiles(jsonPath, result.jsonUpdates[lang as keyof typeof result.jsonUpdates], lang, dryRun);
  });

  if (!dryRun) {
    // 코드 파일 업데이트
    fs.writeFileSync(result.filePath, result.updatedCode, 'utf-8');
    console.log(`\n   ✅ 코드 파일 업데이트 완료: ${result.filePath}\n`);
  } else {
    console.log(`\n   📝 (DRY-RUN) 코드 파일은 업데이트되지 않았습니다.\n`);
  }
}

// 메인 실행
function main() {
  const args = process.argv.slice(2);
  const filePath = args[0];
  const dryRun = args.includes('--dry-run');

  if (!filePath) {
    console.error('\n❌ 오류: 파일 경로를 지정해주세요.\n');
    console.log('사용법: npm run i18n:migrate -- <file-path> [--dry-run]\n');
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`\n❌ 오류: 파일을 찾을 수 없습니다: ${filePath}\n`);
    process.exit(1);
  }

  console.log(`\n🚀 i18n 마이그레이션 시작${dryRun ? ' (DRY-RUN 모드)' : ''}\n`);

  const result = migrateFile({ filePath, dryRun });

  printResult(result, dryRun);

  if (dryRun) {
    console.log('💡 실제로 파일을 수정하려면 --dry-run 플래그를 제거하세요.\n');
  } else {
    console.log('✨ 마이그레이션 완료!\n');
  }
}

main();
