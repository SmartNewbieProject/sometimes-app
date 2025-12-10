// 수정된 페이지 구조
const correctedPages = {
  // 한국어가 남아있는 페이지들
  community: {
    path: '/community',
    file: 'jp_screenshot/02_community/01_community_list.png',
    koreanTexts: {
      '공지사항': 'お知らせ',
      '등록된 공지가 없습니다': '登録されたお知らせはありません',
      '인기': '人気',
      '현재 인기 글이 없습니다': '現在人気の投稿はありません',
      '[FAQ] 자주묻는 질문': '[FAQ] よくある質問'
    }
  },

  momentQuestion: {
    path: '/moment/question-detail',
    file: 'jp_screenshot/04_moment/02_moment_question.png'
  },

  myMomentRecord: {
    path: '/moment/my-moment-record',
    file: 'jp_screenshot/04_moment/03_my_moment_record.png',
    koreanTexts: {
      '나의 모먼트 기록': 'マイモーメント記録',
      '나의 성장 트렌드': '成長トレンド',
      '최근 4주간의 모먼트 변화를 보여줘요': '最近4週間のモーメント変化を表示します',
      '주차': '週目',
      '안정을 추구하는 사교적 실용가': '安定を追求する社交的実用家',
      '끈기 있게 고민하면서도 단호하게 행동하는 현실주의자': '粘り強く悩みながらも断固として行動する現実主義者',
      '집에서 안정을 추구하는 관찰자': '家で安定を追求する観察者',
      '혼자 게임을 즐기는 현실적 내향형': '一人でゲームを楽しむ現実的内向型',
      '자세히 보기': '詳しく見る'
    }
  },

  weeklyReport: {
    path: '/moment/weekly-report',
    file: 'jp_screenshot/04_moment/04_weekly_report.png',
    koreanTexts: {
      '주간 리포트': '週間レポート',
      '이번 주': '今週',
      '지난 주': '先週'
    }
  },

  // 올바른 경로들
  settings: {
    path: '/setting',
    file: 'jp_screenshot/05_mypage/02_settings.png'
  },

  myInfo: {
    path: '/my-info',
    file: 'jp_screenshot/05_mypage/03_my_info.png'
  },

  myActivity: {
    path: '/community/my/my-articles',
    file: 'jp_screenshot/05_mypage/04_my_activity.png'
  },

  notifications: {
    path: '/notification',
    file: 'jp_screenshot/05_mypage/05_notifications.png'
  },

  profileImgStatus: {
    path: '/my/approval-step/waiting',
    file: 'jp_screenshot/05_mypage/06_profile_image_status.png'
  }
};

console.log(JSON.stringify(correctedPages, null, 2));
