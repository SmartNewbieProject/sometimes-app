// 자동 스크린샷 캡처 시스템
const fs = require('fs');
const path = require('path');

class ScreenshotAutomation {
  constructor() {
    this.outputDir = 'jp_screenshot';
    this.metadata = {
      captureDate: new Date().toISOString(),
      totalPages: 0,
      successCount: 0,
      excludedCount: 0,
      tree: {},
      excluded: []
    };

    // 페이지 구조 정의
    this.pageStructure = {
      '01_home': {
        name: 'ホーム',
        pages: [
          { file: '01_main_feed.png', path: '/home', description: 'メインフィード' },
          { file: '02_user_card.png', path: '/home', description: 'ユーザーカード詳細' }
        ]
      },
      '02_community': {
        name: 'コミュニティ',
        pages: [
          { file: '01_community_list.png', path: '/community', description: 'コミュニティ一覧' }
        ]
      },
      '03_chat': {
        name: 'チャット',
        pages: [
          { file: '01_chat_list.png', path: '/chat', description: 'チャット一覧' },
          { file: '02_somemate_chat.png', path: '/chat/somemate-chat', description: 'サムメイトチャット' },
          { file: '03_somemate_intro.png', path: '/chat/somemate', description: 'サムメイト紹介' }
        ]
      },
      '04_moment': {
        name: 'モーメント',
        pages: [
          { file: '01_moment_main.png', path: '/moment', description: 'モーメントメイン' },
          { file: '02_moment_question.png', path: '/moment/question', description: '今日の質問' },
          { file: '03_my_moment_record.png', path: '/moment/my-moment-record', description: 'マイモーメント記録' },
          { file: '04_weekly_report.png', path: '/moment/weekly-report', description: '週間レポート' }
        ]
      },
      '05_mypage': {
        name: 'マイページ',
        pages: [
          { file: '01_profile.png', path: '/my', description: 'プロフィール' },
          { file: '02_settings.png', path: '/my/setting', description: '設定' },
          { file: '03_my_info.png', path: '/my/my-info', description: 'マイ情報' },
          { file: '04_my_activity.png', path: '/my/my-activity', description: 'マイ活動' },
          { file: '05_notifications.png', path: '/my/notification', description: '通知設定' },
          { file: '06_profile_image_status.png', path: '/my/profile-img-status', description: 'プロフィール画像ステータス' },
          { file: '07_withdrawal.png', path: '/my/withdrawal', description: '退会' }
        ]
      }
    };

    // 한국어 → 일본어 키워드 매핑
    this.translationMap = {
      // 사용자 정보
      '국호진': '田中太郎',
      '이화여자대학교': 'イファ女子大学',
      '경성대학교': 'キョンソン大学',
      '동아대학교': 'トンア大学',
      '건양대학교': 'コニャン大学',
      '한밭대학교': 'ハンバット大学',

      // 초대 배너
      '친구 초대하면': '友達を招待すると',
      '나도 친구도': '私も友達も',
      '초대하러 가기': '招待する',

      // 상태 텍스트
      '마지막 접속': '最終接続',
      '일 이상': '日以上',
      '다정다감한 스타일': '優しくて感じの良いスタイル',

      // 사업자 정보
      '상호명': '商号',
      '사업장 소재지': '事業場所在地',
      '대표': '代表',
      '사업자 등록번호': '事業者登録番号',
      '통신판매업신고': '通信販売業申告',
      '문의전화': 'お問い合わせ電話',
      '이메일': 'メール',
      '사업자정보확인': '事業者情報確認',

      // 기타
      '구슬': 'ビーズ'
    };
  }

  // 한국어 감지 및 번역
  detectAndTranslateKorean(text) {
    // 한글 유니코드 범위: AC00-D7A3
    const hasKorean = /[\uAC00-\uD7A3]/.test(text);

    if (!hasKorean) {
      return { hasKorean: false, translated: text };
    }

    let translated = text;
    for (const [ko, ja] of Object.entries(this.translationMap)) {
      translated = translated.replace(new RegExp(ko, 'g'), ja);
    }

    return { hasKorean: true, translated };
  }

  // 페이지별 한국어 텍스트 교체 함수 생성
  generateTranslationScript() {
    return `
      (function() {
        const translationMap = ${JSON.stringify(this.translationMap)};

        // 모든 텍스트 노드 순회 및 교체
        function translateNode(node) {
          if (node.nodeType === Node.TEXT_NODE) {
            let text = node.textContent;
            let hasKorean = /[\uAC00-\uD7A3]/.test(text);

            if (hasKorean) {
              for (const [ko, ja] of Object.entries(translationMap)) {
                text = text.replace(new RegExp(ko, 'g'), ja);
              }
              node.textContent = text;
            }
          } else {
            for (const child of node.childNodes) {
              translateNode(child);
            }
          }
        }

        // 전체 문서 번역
        translateNode(document.body);

        // placeholder, aria-label 등 속성도 번역
        document.querySelectorAll('[placeholder], [aria-label], [title]').forEach(el => {
          ['placeholder', 'aria-label', 'title'].forEach(attr => {
            const value = el.getAttribute(attr);
            if (value && /[\uAC00-\uD7A3]/.test(value)) {
              let translated = value;
              for (const [ko, ja] of Object.entries(translationMap)) {
                translated = translated.replace(new RegExp(ko, 'g'), ja);
              }
              el.setAttribute(attr, translated);
            }
          });
        });

        return {
          success: true,
          message: '번역 완료'
        };
      })();
    `;
  }

  // 디렉터리 구조 생성
  createDirectories() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir);
    }

    for (const [dir, info] of Object.entries(this.pageStructure)) {
      const dirPath = path.join(this.outputDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
      }
    }
  }

  // 메타데이터 저장
  saveMetadata() {
    const metadataPath = path.join(this.outputDir, 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(this.metadata, null, 2));
  }

  // 페이지 목록 생성
  getAllPages() {
    const pages = [];

    for (const [dirName, info] of Object.entries(this.pageStructure)) {
      for (const page of info.pages) {
        pages.push({
          category: dirName,
          categoryName: info.name,
          ...page,
          outputPath: path.join(this.outputDir, dirName, page.file)
        });
      }
    }

    this.metadata.totalPages = pages.length;
    return pages;
  }

  // 결과 요약 출력
  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('✓ スクリーンショット キャプチャ 完了');
    console.log('='.repeat(60));
    console.log(`\n📊 結果サマリー:`);
    console.log(`  総ページ数: ${this.metadata.totalPages}`);
    console.log(`  成功: ${this.metadata.successCount}`);
    console.log(`  除外: ${this.metadata.excludedCount}`);

    if (this.metadata.excluded.length > 0) {
      console.log(`\n⚠  除外されたページ:`);
      this.metadata.excluded.forEach(ex => {
        console.log(`  - ${ex.path} (${ex.reason})`);
      });
    }

    console.log(`\n📁 保存場所: ${path.resolve(this.outputDir)}/`);
    console.log(`📄 メタデータ: ${path.resolve(this.outputDir)}/metadata.json\n`);
  }
}

module.exports = ScreenshotAutomation;
