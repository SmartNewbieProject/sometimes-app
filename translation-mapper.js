// 일본어 번역 매핑 유틸리티
const fs = require('fs');
const path = require('path');

class TranslationMapper {
  constructor() {
    this.translations = {};
    this.loadAllTranslations();
  }

  loadAllTranslations() {
    const jaDir = path.join(__dirname, 'src/shared/libs/locales/ja');
    this.loadDirectory(jaDir);
  }

  loadDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        this.loadDirectory(fullPath);
      } else if (file.endsWith('.json')) {
        try {
          const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
          this.flattenObject(content, this.translations);
        } catch (e) {
          console.error(`Error loading ${fullPath}:`, e.message);
        }
      }
    });
  }

  flattenObject(obj, target, prefix = '') {
    for (const key in obj) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        this.flattenObject(value, target, newKey);
      } else {
        target[newKey] = value;
      }
    }
  }

  // 한국어 → 일본어 변환 (근사 매칭)
  translate(koreanText) {
    // 정확한 매칭 시도
    for (const [key, japaneseText] of Object.entries(this.translations)) {
      if (typeof japaneseText === 'string' && koreanText.includes(japaneseText)) {
        return japaneseText;
      }
    }

    // 키워드 기반 매칭
    const keywords = {
      '나의 모먼트 기록': 'マイモーメント記録',
      '나의 성장 트렌드': '成長トレンド',
      '최근 4주간': '最近4週間',
      '모먼트 변화': 'モーメント変化',
      '자세히 보기': '詳しく見る',
      '안정': '安定',
      '활발': '活発',
      '사교': '社交',
      '고민': '悩み',
      '끈기': '粘り強さ',
      '불안': '不安',
      '내향': '内向',
      '소극': '消極的',
      '혼자': '一人',
      '집콕': '引きこもり',
      '게임': 'ゲーム',
      '안정을 추구하는 사교적 실용가': '安定を追求する社交的実用家',
      '끈기 있게 고민하면서도 단호하게 행동하는 현실주의자': '粘り強く悩みながらも断固として行動する現実主義者',
      '집에서 안정을 추구하는 관찰자': '家で安定を追求する観察者',
      '혼자 게임을 즐기는 현실적 내향형': '一人でゲームを楽しむ現実的内向型'
    };

    for (const [ko, ja] of Object.entries(keywords)) {
      if (koreanText.includes(ko)) {
        return koreanText.replace(ko, ja);
      }
    }

    return koreanText; // 변환 실패 시 원문 반환
  }

  getAllTranslations() {
    return this.translations;
  }
}

module.exports = new TranslationMapper();
