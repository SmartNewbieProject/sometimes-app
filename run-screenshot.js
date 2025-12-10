#!/usr/bin/env node

// Chrome MCP를 통한 자동 스크린샷 실행 스크립트
// 이 스크립트는 Claude가 Chrome MCP 도구를 사용하여 실행합니다

const ScreenshotAutomation = require('./screenshot-automation');

const automation = new ScreenshotAutomation();

// 디렉터리 생성
automation.createDirectories();

// 모든 페이지 목록 가져오기
const pages = automation.getAllPages();

console.log('📸 自動スクリーンショット キャプチャ 開始');
console.log(`総 ${pages.length} ページをキャプチャします\n`);

// 번역 스크립트 생성
const translationScript = automation.generateTranslationScript();

// 페이지 정보 출력
console.log('📋 キャプチャするページ:\n');
pages.forEach((page, index) => {
  console.log(`${index + 1}. [${page.categoryName}] ${page.description}`);
  console.log(`   Path: ${page.path}`);
  console.log(`   Output: ${page.outputPath}\n`);
});

// Claude에게 실행 지시를 위한 정보 출력
console.log('\n' + '='.repeat(60));
console.log('Claude에게 다음 작업을 수행하도록 요청:');
console.log('='.repeat(60));
console.log(`
1. 각 페이지로 이동 (navigate_page 사용)
2. 페이지 로딩 대기 (2-3초)
3. 번역 스크립트 실행 (evaluate_script 사용)
4. 스크린샷 촬영 (take_screenshot 사용)
5. 다음 페이지로 진행

번역 스크립트:
${translationScript}
`);

// JSON 출력 (Claude가 파싱하기 쉽도록)
console.log('\n' + JSON.stringify({ pages, translationScript }, null, 2));
