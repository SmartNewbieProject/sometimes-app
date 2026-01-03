#!/usr/bin/env node

/**
 * Mixpanel 매칭 대시보드 배포 스크립트
 *
 * 생성된 dashboard-config.json을 읽어서 실제로 Mixpanel에 생성
 *
 * 사용법:
 *   node scripts/deploy-mixpanel-dashboard.js
 *
 * 환경변수:
 *   MIXPANEL_API_SECRET=3f1b97d815027821e7e1e93c73bad5a4
 *   MIXPANEL_PROJECT_ID=3375891
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Mixpanel API 설정
const MIXPANEL_SERVICE_USERNAME = process.env.MIXPANEL_SERVICE_ACCOUNT_USERNAME;
const MIXPANEL_SERVICE_SECRET = process.env.MIXPANEL_SERVICE_ACCOUNT_SECRET;
const MIXPANEL_PROJECT_ID = process.env.MIXPANEL_PROJECT_ID || '3726144';
const BASE_URL = 'mixpanel.com';

// Service Account credentials 확인
if (!MIXPANEL_SERVICE_USERNAME || !MIXPANEL_SERVICE_SECRET) {
  console.error('❌ Error: Service Account credentials not found');
  console.error('\nRequired environment variables:');
  console.error('  - MIXPANEL_SERVICE_ACCOUNT_USERNAME');
  console.error('  - MIXPANEL_SERVICE_ACCOUNT_SECRET');
  console.error('\nPlease add them to .env.local:');
  console.error('MIXPANEL_SERVICE_ACCOUNT_USERNAME=your_id.mp-service-account');
  console.error('MIXPANEL_SERVICE_ACCOUNT_SECRET=your_secret_key');
  console.error('\n📚 For setup instructions, see: docs/MIXPANEL_SERVICE_ACCOUNT_SETUP.md\n');
  process.exit(1);
}

// Base64 인코딩 (username:secret)
const authToken = Buffer.from(`${MIXPANEL_SERVICE_USERNAME}:${MIXPANEL_SERVICE_SECRET}`).toString('base64');

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
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const response = JSON.parse(body);
            resolve(response);
          } catch (e) {
            resolve({ success: true, raw: body });
          }
        } else {
          reject(new Error(`API Error ${res.statusCode}: ${body}`));
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
 * Insight 생성
 */
async function createInsight(insightConfig) {
  console.log(`\n📊 Creating insight: ${insightConfig.name}...`);

  const payload = {
    name: insightConfig.name,
    description: insightConfig.description,
    chart_type: insightConfig.chart_type,
    bookmark_params: insightConfig.query
  };

  try {
    const response = await callMixpanelAPI(
      `/api/app/projects/${MIXPANEL_PROJECT_ID}/saved-reports`,
      'POST',
      payload
    );

    console.log(`✅ Created: ${insightConfig.name}`);
    return response;
  } catch (error) {
    console.error(`❌ Failed to create ${insightConfig.name}:`, error.message);
    return null;
  }
}

/**
 * Funnel 생성
 */
async function createFunnel(funnelConfig) {
  console.log(`\n🚀 Creating funnel: ${funnelConfig.name}...`);

  const payload = {
    name: funnelConfig.name,
    description: funnelConfig.description,
    funnel_query: funnelConfig.query
  };

  try {
    const response = await callMixpanelAPI(
      `/api/app/projects/${MIXPANEL_PROJECT_ID}/funnels`,
      'POST',
      payload
    );

    console.log(`✅ Created: ${funnelConfig.name}`);
    return response;
  } catch (error) {
    console.error(`❌ Failed to create ${funnelConfig.name}:`, error.message);
    return null;
  }
}

/**
 * Dashboard 생성
 */
async function createDashboard(dashboardConfig, createdInsights, createdFunnels) {
  console.log(`\n📋 Creating dashboard: ${dashboardConfig.name}...`);

  // Widget ID 매핑 생성
  const widgetIdMap = {};

  for (const insight of createdInsights) {
    if (insight && insight.id) {
      widgetIdMap[insight.name] = insight.id;
    }
  }

  for (const funnel of createdFunnels) {
    if (funnel && funnel.id) {
      widgetIdMap[funnel.name] = funnel.id;
    }
  }

  // Dashboard payload 생성
  const widgets = dashboardConfig.widgets.map(widget => ({
    type: widget.type,
    id: widgetIdMap[widget.name],
    layout: widget.position
  })).filter(w => w.id); // ID가 있는 것만 포함

  const payload = {
    name: dashboardConfig.name,
    description: dashboardConfig.description,
    widgets: widgets
  };

  try {
    const response = await callMixpanelAPI(
      `/api/app/projects/${MIXPANEL_PROJECT_ID}/boards`,
      'POST',
      payload
    );

    console.log(`✅ Created: ${dashboardConfig.name}`);
    return response;
  } catch (error) {
    console.error(`❌ Failed to create dashboard:`, error.message);
    return null;
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   Mixpanel 매칭 대시보드 배포 스크립트                   ║');
  console.log('║   Project ID: ' + MIXPANEL_PROJECT_ID.padEnd(43) + '║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  // 설정 파일 로드
  const configPath = path.join(__dirname, 'mixpanel-dashboard-config.json');

  if (!fs.existsSync(configPath)) {
    console.error('\n❌ Error: Configuration file not found');
    console.error('   Please run create-mixpanel-dashboard.js first');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  console.log('\n✅ Configuration loaded');

  try {
    // 1. Insights 생성
    console.log('\n' + '='.repeat(60));
    console.log('STEP 1: Creating Insights');
    console.log('='.repeat(60));

    const createdInsights = [];
    for (const [key, insightConfig] of Object.entries(config.insights)) {
      const result = await createInsight(insightConfig);
      if (result) {
        createdInsights.push({ ...result, name: insightConfig.name });
      }
      // API rate limiting 방지
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 2. Funnels 생성
    console.log('\n' + '='.repeat(60));
    console.log('STEP 2: Creating Funnels');
    console.log('='.repeat(60));

    const createdFunnels = [];
    for (const [key, funnelConfig] of Object.entries(config.funnels)) {
      const result = await createFunnel(funnelConfig);
      if (result) {
        createdFunnels.push({ ...result, name: funnelConfig.name });
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 3. Dashboard 생성
    console.log('\n' + '='.repeat(60));
    console.log('STEP 3: Creating Dashboard');
    console.log('='.repeat(60));

    const dashboard = await createDashboard(
      config.dashboard,
      createdInsights,
      createdFunnels
    );

    // 결과 요약
    console.log('\n' + '='.repeat(60));
    console.log('DEPLOYMENT SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Insights created: ${createdInsights.length}/${Object.keys(config.insights).length}`);
    console.log(`✅ Funnels created: ${createdFunnels.length}/${Object.keys(config.funnels).length}`);
    console.log(`${dashboard ? '✅' : '❌'} Dashboard: ${config.dashboard.name}`);

    if (dashboard && dashboard.id) {
      console.log('\n🎉 Dashboard successfully created!');
      console.log(`📊 View it at: https://mixpanel.com/project/${MIXPANEL_PROJECT_ID}/view/${dashboard.id}/dashboard`);
    }

    console.log('\n📝 Note: Some API endpoints may require additional permissions or may not be publicly documented.');
    console.log('   If automated creation fails, please use the generated configuration to create manually in Mixpanel UI.');
    console.log('   Reference: docs/MIXPANEL_MATCHING_DASHBOARD_GUIDE.md\n');

  } catch (error) {
    console.error('\n❌ Deployment Error:', error.message);
    console.error('\n💡 Fallback: Use manual creation with MIXPANEL_MATCHING_DASHBOARD_GUIDE.md');
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = {
  createInsight,
  createFunnel,
  createDashboard
};
