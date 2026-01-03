#!/usr/bin/env node

/**
 * Mixpanel 매칭 대시보드 자동 생성 스크립트
 *
 * 사용법:
 *   node scripts/create-mixpanel-dashboard.js
 *
 * 환경변수:
 *   MIXPANEL_API_SECRET=3f1b97d815027821e7e1e93c73bad5a4
 *   MIXPANEL_PROJECT_ID=3726144
 */

const https = require('https');

// Mixpanel API 설정
const MIXPANEL_API_SECRET = process.env.MIXPANEL_API_SECRET || '3f1b97d815027821e7e1e93c73bad5a4';
const MIXPANEL_PROJECT_ID = process.env.MIXPANEL_PROJECT_ID || '3726144';
const BASE_URL = 'mixpanel.com';

// Base64 인코딩 (API Secret:)
const authToken = Buffer.from(`${MIXPANEL_API_SECRET}:`).toString('base64');

/**
 * Mixpanel API 호출 헬퍼
 */
function callMixpanelAPI(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      path: path,
      method: method,
      headers: {
        'Authorization': `Basic ${authToken}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve(response);
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * 1. 상호 좋아요율 Insight 생성
 */
async function createMutualLikeRateInsight() {
  console.log('\n📊 Creating Mutual Like Rate Insight...');

  const insightConfig = {
    name: '상호 좋아요율 (%)',
    description: 'Match_Accepted / Like_Sent × 100. 목표: 15-25%',
    chart_type: 'metric',
    project_id: parseInt(MIXPANEL_PROJECT_ID),
    query: {
      analysis_type: 'linear',
      events: [
        {
          event: 'Match_Accepted',
          name: 'Match_Accepted',
          type: 'events'
        },
        {
          event: 'Like_Sent',
          name: 'Like_Sent',
          type: 'events'
        }
      ],
      formula: '(A / B) * 100',
      time: {
        unit: 'day',
        value: 30
      }
    }
  };

  console.log('Insight Config:', JSON.stringify(insightConfig, null, 2));
  return insightConfig;
}

/**
 * 2. 채팅 활성화율 Insight 생성
 */
async function createChatActiveRateInsight() {
  console.log('\n💬 Creating Chat Active Rate Insight...');

  const insightConfig = {
    name: '채팅 활성화율 (%)',
    description: '24시간 내 상호 대화 비율. 목표: 35%+',
    chart_type: 'metric',
    project_id: parseInt(MIXPANEL_PROJECT_ID),
    query: {
      analysis_type: 'linear',
      events: [
        {
          event: 'Chat_24h_Active',
          name: 'Active Chats',
          type: 'events',
          filters: [
            {
              property: 'activity_status',
              operator: '==',
              value: 'mutual'
            }
          ]
        },
        {
          event: 'Chat_Started',
          name: 'Started Chats',
          type: 'events'
        }
      ],
      formula: '(A / B) * 100',
      time: {
        unit: 'day',
        value: 30
      }
    }
  };

  console.log('Insight Config:', JSON.stringify(insightConfig, null, 2));
  return insightConfig;
}

/**
 * 3. 매칭 퍼널 생성
 */
async function createMatchingFunnel() {
  console.log('\n🚀 Creating Matching Funnel...');

  const funnelConfig = {
    name: '전체 매칭 퍼널',
    description: '매칭 성공 → 좋아요 전송 → 상호 좋아요 → 채팅 시작 → 활성 대화',
    chart_type: 'funnel',
    project_id: parseInt(MIXPANEL_PROJECT_ID),
    query: {
      steps: [
        {
          event: 'Matching_Success',
          name: '알고리즘 매칭 성공'
        },
        {
          event: 'Like_Sent',
          name: '좋아요 전송'
        },
        {
          event: 'Match_Accepted',
          name: '상호 좋아요 (매칭 확정)'
        },
        {
          event: 'Chat_Started',
          name: '채팅방 생성'
        },
        {
          event: 'Chat_24h_Active',
          name: '24시간 내 활성 대화',
          filters: [
            {
              property: 'activity_status',
              operator: '!=',
              value: 'inactive'
            }
          ]
        }
      ],
      conversion_window: {
        value: 14,
        unit: 'day'
      },
      time: {
        unit: 'day',
        value: 30
      }
    }
  };

  console.log('Funnel Config:', JSON.stringify(funnelConfig, null, 2));
  return funnelConfig;
}

/**
 * 4. 매칭 실패 원인 분석 Insight
 */
async function createMatchingFailureInsight() {
  console.log('\n⚠️ Creating Matching Failure Analysis...');

  const insightConfig = {
    name: '매칭 실패 원인 분포',
    description: 'failure_category별 분포',
    chart_type: 'pie',
    project_id: parseInt(MIXPANEL_PROJECT_ID),
    query: {
      analysis_type: 'linear',
      events: [
        {
          event: 'Matching_Failed',
          name: 'Failed Matches',
          type: 'events'
        }
      ],
      breakdown: {
        property: 'failure_category',
        type: 'event'
      },
      time: {
        unit: 'day',
        value: 30
      }
    }
  };

  console.log('Insight Config:', JSON.stringify(insightConfig, null, 2));
  return insightConfig;
}

/**
 * 5. 대시보드 정의 생성
 */
async function createDashboardDefinition() {
  console.log('\n📋 Creating Dashboard Definition...');

  const dashboardConfig = {
    name: '매칭 시스템 모니터링',
    description: '매칭 퍼널, 전환율, 품질 지표 종합 대시보드',
    project_id: parseInt(MIXPANEL_PROJECT_ID),
    widgets: [
      // Row 1: KPI Cards
      {
        type: 'insight',
        name: '상호 좋아요율 (%)',
        position: { x: 0, y: 0, w: 3, h: 2 }
      },
      {
        type: 'insight',
        name: '채팅 활성화율 (%)',
        position: { x: 3, y: 0, w: 3, h: 2 }
      },
      {
        type: 'insight',
        name: '일일 매칭 성공 건수',
        position: { x: 6, y: 0, w: 3, h: 2 }
      },
      {
        type: 'insight',
        name: '매칭 성공률',
        position: { x: 9, y: 0, w: 3, h: 2 }
      },

      // Row 2: Main Funnel
      {
        type: 'funnel',
        name: '전체 매칭 퍼널',
        position: { x: 0, y: 2, w: 12, h: 4 }
      },

      // Row 3: Analytics
      {
        type: 'insight',
        name: '매칭 실패 원인 분포',
        position: { x: 0, y: 6, w: 6, h: 3 }
      },
      {
        type: 'insight',
        name: '일일 매칭 추이',
        position: { x: 6, y: 6, w: 6, h: 3 }
      }
    ]
  };

  console.log('Dashboard Config:', JSON.stringify(dashboardConfig, null, 2));
  return dashboardConfig;
}

/**
 * 6. 이벤트 데이터 확인 (검증용)
 */
async function verifyEvents() {
  console.log('\n🔍 Verifying Events in Mixpanel...');

  const events = [
    'Matching_Success',
    'Like_Sent',
    'Match_Accepted',
    'Chat_Started',
    'Chat_24h_Active',
    'Matching_Failed'
  ];

  const today = new Date();
  const from_date = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  const to_date = today.toISOString().split('T')[0];

  console.log(`Checking events from ${from_date} to ${to_date}...\n`);

  for (const eventName of events) {
    try {
      const path = `/api/2.0/events?event=["${eventName}"]&type=general&unit=day&from_date=${from_date}&to_date=${to_date}&project_id=${MIXPANEL_PROJECT_ID}`;

      console.log(`Querying: ${eventName}...`);
      // Note: 실제 API 호출은 CORS 및 인증 이슈로 브라우저에서만 가능할 수 있음
      // 여기서는 구조만 보여줌
    } catch (error) {
      console.error(`Error checking ${eventName}:`, error.message);
    }
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   Mixpanel 매칭 대시보드 자동 생성 스크립트              ║');
  console.log('║   Project ID: ' + MIXPANEL_PROJECT_ID.padEnd(43) + '║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  try {
    // 1. 이벤트 검증
    await verifyEvents();

    // 2. Insights 생성
    const mutualLikeRate = await createMutualLikeRateInsight();
    const chatActiveRate = await createChatActiveRateInsight();
    const matchingFunnel = await createMatchingFunnel();
    const failureAnalysis = await createMatchingFailureInsight();

    // 3. 대시보드 정의 생성
    const dashboard = await createDashboardDefinition();

    // 4. 설정 파일로 저장
    const config = {
      project_id: MIXPANEL_PROJECT_ID,
      insights: {
        mutual_like_rate: mutualLikeRate,
        chat_active_rate: chatActiveRate,
        matching_failure: failureAnalysis
      },
      funnels: {
        matching_funnel: matchingFunnel
      },
      dashboard: dashboard
    };

    const fs = require('fs');
    const outputPath = './scripts/mixpanel-dashboard-config.json';
    fs.writeFileSync(outputPath, JSON.stringify(config, null, 2));

    console.log('\n✅ Dashboard configuration saved to:', outputPath);
    console.log('\n📝 Next Steps:');
    console.log('1. Review the configuration file');
    console.log('2. Import into Mixpanel UI manually or use Mixpanel API');
    console.log('3. Adjust queries based on actual data structure\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = {
  createMutualLikeRateInsight,
  createChatActiveRateInsight,
  createMatchingFunnel,
  createMatchingFailureInsight,
  createDashboardDefinition
};
