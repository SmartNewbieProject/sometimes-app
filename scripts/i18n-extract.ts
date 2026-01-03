#!/usr/bin/env tsx
/**
 * i18n 마이그레이션 도구 - 한글 문자열 추출
 *
 * 사용법:
 *   npm run i18n:extract -- <file-path>
 *   npm run i18n:extract -- src/features/auth
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

// 한글 패턴 정규식
const PATTERNS = {
  // 문자열 리터럴 내 한글 (따옴표 포함)
  stringLiteral: /['"`]([가-힣]+[가-힣\s!?.,()\/\-:]*?)['"`]/g,

  // title: "한글"
  titleProperty: /title:\s*['"`]([가-힣]+[가-힣\s!?.,()]*?)['"`]/g,

  // Alert.alert("제목", "내용")
  alert: /Alert\.alert\s*\(\s*['"`]([가-힣]+[가-힣\s!?.,()]*?)['"`]/g,

  // showModal({ title: "한글" })
  modal: /showModal\s*\(\s*\{[^}]*title:\s*['"`]([가-힣]+[가-힣\s!?.,()]*?)['"`]/g,

  // t() 함수 호출 (이미 i18n 적용된 것 제외)
  alreadyTranslated: /\bt\s*\(['"`][^'"`]+['"`]\)/g,

  // console.log (제외 대상)
  consoleLog: /console\.(log|error|warn|info|debug)/g,

  // 주석 (제외 대상)
  comments: /\/\/.*|\/\*[\s\S]*?\*\//g,
};

interface ExtractedString {
  text: string;
  line: number;
  column: number;
  context: string;
  type: 'title' | 'alert' | 'modal' | 'string' | 'error';
}

interface FileAnalysis {
  filePath: string;
  strings: ExtractedString[];
  alreadyTranslated: number;
  totalKorean: number;
}

/**
 * 파일에서 한글 문자열 추출
 */
function extractKoreanStrings(filePath: string): FileAnalysis {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const strings: ExtractedString[] = [];
  const alreadyTranslatedSet = new Set<string>();

  // 이미 번역된 것 찾기
  const translatedMatches = content.matchAll(PATTERNS.alreadyTranslated);
  for (const match of translatedMatches) {
    alreadyTranslatedSet.add(match[0]);
  }

  // console.log 라인 찾기 (제외 대상)
  const consoleLogLines = new Set<number>();
  lines.forEach((line, idx) => {
    if (PATTERNS.consoleLog.test(line)) {
      consoleLogLines.add(idx);
    }
  });

  // 주석 제거
  const contentWithoutComments = content.replace(PATTERNS.comments, '');

  // 한글 문자열 추출
  lines.forEach((line, lineIdx) => {
    // console.log 라인은 건너뛰기
    if (consoleLogLines.has(lineIdx)) {
      return;
    }

    // 주석 라인 건너뛰기
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*') || trimmedLine.startsWith('*')) {
      return;
    }

    // 이미 t() 함수로 번역된 라인 건너뛰기
    if (line.includes('t(')) {
      return;
    }

    // 한글 패턴 매칭
    const koreanMatches = line.matchAll(/['"`]([가-힣]+[가-힣\s!?.,()\/\-:]*?)['"`]/g);

    for (const match of koreanMatches) {
      const text = match[1].trim();

      // 빈 문자열이나 공백만 있는 경우 제외
      if (!text || text.length < 2) continue;

      // 타입 판별
      let type: ExtractedString['type'] = 'string';
      if (line.includes('title:')) type = 'title';
      else if (line.includes('Alert.alert')) type = 'alert';
      else if (line.includes('showModal')) type = 'modal';
      else if (line.includes('error') || line.includes('Error')) type = 'error';

      strings.push({
        text,
        line: lineIdx + 1,
        column: match.index ?? 0,
        context: line.trim(),
        type,
      });
    }
  });

  return {
    filePath,
    strings,
    alreadyTranslated: alreadyTranslatedSet.size,
    totalKorean: strings.length,
  };
}

/**
 * i18n 키 생성 (파일 경로 기반)
 */
function generateI18nKey(filePath: string, text: string, type: string): string {
  // 파일 경로에서 키 생성
  const relativePath = filePath.replace(/^(src|app)\//, '');
  const parts = relativePath.split('/');

  let prefix = '';

  // FSD 레이어별 prefix
  if (filePath.startsWith('app/')) {
    prefix = 'apps';
  } else if (filePath.includes('features/')) {
    prefix = 'features';
  } else if (filePath.includes('widgets/')) {
    prefix = 'widgets';
  } else if (filePath.includes('shared/')) {
    prefix = 'shareds';
  }

  // 디렉터리 경로에서 feature/module 이름 추출
  const featureName = parts[parts.length - 2] || parts[parts.length - 1];

  // 텍스트를 snake_case로 변환
  const textKey = text
    .slice(0, 30) // 최대 30자
    .toLowerCase()
    .replace(/[^\w가-힣]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  return `${prefix}.${featureName}.${type}_${textKey}`;
}

/**
 * 디렉터리 재귀 분석
 */
async function analyzeDirectory(dirPath: string): Promise<FileAnalysis[]> {
  const pattern = `${dirPath}/**/*.{ts,tsx}`;
  const files = await glob(pattern, {
    ignore: [
      '**/node_modules/**',
      '**/*.test.{ts,tsx}',
      '**/*.spec.{ts,tsx}',
      '**/locales/**',
    ],
  });

  const results: FileAnalysis[] = [];

  for (const file of files) {
    const analysis = extractKoreanStrings(file);
    if (analysis.strings.length > 0) {
      results.push(analysis);
    }
  }

  return results;
}

/**
 * 결과 출력
 */
function printResults(results: FileAnalysis[]) {
  console.log('\n📊 i18n 마이그레이션 분석 결과\n');

  const totalFiles = results.length;
  const totalStrings = results.reduce((sum, r) => sum + r.totalKorean, 0);
  const totalTranslated = results.reduce((sum, r) => sum + r.alreadyTranslated, 0);

  console.log(`총 파일: ${totalFiles}개`);
  console.log(`총 한글 문자열: ${totalStrings}개`);
  console.log(`이미 번역됨: ${totalTranslated}개`);
  console.log(`남은 작업: ${totalStrings}개\n`);

  console.log('─'.repeat(80));

  // 파일별 상세 결과
  results
    .sort((a, b) => b.strings.length - a.strings.length)
    .slice(0, 20) // 상위 20개만 출력
    .forEach((result) => {
      console.log(`\n📄 ${result.filePath}`);
      console.log(`   한글: ${result.totalKorean}개 | 번역됨: ${result.alreadyTranslated}개\n`);

      result.strings.slice(0, 5).forEach((str) => {
        const key = generateI18nKey(result.filePath, str.text, str.type);
        console.log(`   Line ${str.line} [${str.type}]: "${str.text}"`);
        console.log(`   → 키: ${key}`);
        console.log(`   → 컨텍스트: ${str.context.slice(0, 60)}...`);
        console.log();
      });

      if (result.strings.length > 5) {
        console.log(`   ... 외 ${result.strings.length - 5}개 더\n`);
      }
    });

  if (results.length > 20) {
    console.log(`\n... 외 ${results.length - 20}개 파일 더\n`);
  }
}

/**
 * JSON 파일 생성
 */
function generateJSONReport(results: FileAnalysis[], outputPath: string) {
  const report = {
    summary: {
      totalFiles: results.length,
      totalStrings: results.reduce((sum, r) => sum + r.totalKorean, 0),
      alreadyTranslated: results.reduce((sum, r) => sum + r.alreadyTranslated, 0),
      timestamp: new Date().toISOString(),
    },
    files: results.map((r) => ({
      path: r.filePath,
      korean: r.totalKorean,
      translated: r.alreadyTranslated,
      strings: r.strings.map((s) => ({
        text: s.text,
        line: s.line,
        type: s.type,
        suggestedKey: generateI18nKey(r.filePath, s.text, s.type),
      })),
    })),
  };

  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\n✅ JSON 보고서 생성: ${outputPath}`);
}

// 메인 실행
async function main() {
  const targetPath = process.argv[2] || 'src';

  console.log(`\n🔍 분석 시작: ${targetPath}\n`);

  const results = await analyzeDirectory(targetPath);

  printResults(results);

  // JSON 보고서 생성
  const outputPath = path.join(process.cwd(), 'scripts/i18n-report.json');
  generateJSONReport(results, outputPath);

  console.log('\n✨ 완료!\n');
}

main().catch(console.error);
