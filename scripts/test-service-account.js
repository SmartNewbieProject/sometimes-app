#!/usr/bin/env node

/**
 * Mixpanel Service Account 인증 테스트 스크립트
 *
 * Service Account credentials가 올바르게 설정되었는지 확인
 *
 * 사용법:
 *   node scripts/test-service-account.js
 *
 * 환경변수:
 *   MIXPANEL_SERVICE_ACCOUNT_USERNAME={id}.mp-service-account
 *   MIXPANEL_SERVICE_ACCOUNT_SECRET={secret}
 *   MIXPANEL_PROJECT_ID=3375891
 */

const https = require('https');

const username = process.env.MIXPANEL_SERVICE_ACCOUNT_USERNAME;
const secret = process.env.MIXPANEL_SERVICE_ACCOUNT_SECRET;
const projectId = process.env.MIXPANEL_PROJECT_ID || '3375891';

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║   Mixpanel Service Account 인증 테스트                   ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

// Credentials 확인
if (!username || !secret) {
  console.error('❌ Service Account credentials not found\n');
  console.error('Required environment variables:');
  console.error('  - MIXPANEL_SERVICE_ACCOUNT_USERNAME');
  console.error('  - MIXPANEL_SERVICE_ACCOUNT_SECRET');
  console.error('  - MIXPANEL_PROJECT_ID (optional)\n');
  console.error('Please add them to .env.local:\n');
  console.error('MIXPANEL_SERVICE_ACCOUNT_USERNAME=your_id.mp-service-account');
  console.error('MIXPANEL_SERVICE_ACCOUNT_SECRET=your_secret_key');
  process.exit(1);
}

// Credentials 유효성 검증
if (!username.endsWith('.mp-service-account')) {
  console.warn('⚠️  Warning: Username should end with ".mp-service-account"');
  console.warn(`   Current value: ${username}\n`);
}

console.log('📋 Configuration:');
console.log(`   Username: ${username}`);
console.log(`   Secret: ${secret.substring(0, 10)}...${secret.substring(secret.length - 5)}`);
console.log(`   Project ID: ${projectId}\n`);

const authToken = Buffer.from(`${username}:${secret}`).toString('base64');

/**
 * API 호출 테스트 - Projects 목록 조회 및 프로젝트 확인
 */
function testProjectAccess() {
  return new Promise((resolve, reject) => {
    console.log('🔍 Testing API access...');

    const options = {
      hostname: 'mixpanel.com',
      path: '/api/app/projects',
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authToken}`,
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(body);
            const projects = response.results || [];
            console.log('✅ Project access successful!\n');
            console.log('📊 Available Projects:');

            let targetProject = null;
            projects.forEach(project => {
              const isTarget = project.id == projectId;
              console.log(`   ${isTarget ? '→' : ' '} ID: ${project.id} | Name: ${project.name}`);
              if (isTarget) targetProject = project;
            });

            if (targetProject) {
              console.log(`\n✅ Target project ${projectId} found!\n`);
              resolve(targetProject);
            } else {
              console.log(`\n⚠️  Warning: Project ID ${projectId} not found in accessible projects\n`);
              console.log(`   Available IDs: ${projects.map(p => p.id).join(', ')}\n`);
              resolve(projects[0]); // Return first project as fallback
            }
          } catch (e) {
            console.log('✅ API call successful (unable to parse response)\n');
            resolve({ raw: body });
          }
        } else {
          console.error(`❌ API call failed: HTTP ${res.statusCode}\n`);
          console.error('Response:', body, '\n');
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Network error:', error.message, '\n');
      reject(error);
    });

    req.end();
  });
}

/**
 * Saved Reports (Insights) 접근 테스트
 */
function testSavedReportsAccess() {
  return new Promise((resolve, reject) => {
    console.log('🔍 Testing Saved Reports access...');

    const options = {
      hostname: 'mixpanel.com',
      path: `/api/app/projects/${projectId}/saved-reports`,
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authToken}`,
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const reports = JSON.parse(body);
            const count = Array.isArray(reports) ? reports.length : Object.keys(reports).length;
            console.log(`✅ Saved Reports access successful! (${count} reports found)\n`);
            resolve(reports);
          } catch (e) {
            console.log('✅ Saved Reports access successful\n');
            resolve({ raw: body });
          }
        } else {
          console.error(`❌ Saved Reports access failed: HTTP ${res.statusCode}\n`);
          console.error('Response:', body, '\n');
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Network error:', error.message, '\n');
      reject(error);
    });

    req.end();
  });
}

/**
 * 메인 테스트 실행
 */
async function main() {
  try {
    // 1. 프로젝트 접근 테스트
    await testProjectAccess();

    // 2. Saved Reports 접근 테스트 (선택적)
    console.log('🔍 Testing Saved Reports access (optional)...');
    try {
      await testSavedReportsAccess();
    } catch (error) {
      console.log('⚠️  Saved Reports API not accessible (this is normal)');
      console.log('   Mixpanel may restrict programmatic dashboard creation\n');
    }

    // 성공 메시지
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║   ✅ Service Account configured successfully!            ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
    console.log('📝 Note: Mixpanel Management API has limited public endpoints.');
    console.log('   Manual dashboard creation is recommended.\n');
    console.log('📚 See: docs/MIXPANEL_DASHBOARD_MANUAL_SETUP.md\n');

  } catch (error) {
    console.error('╔══════════════════════════════════════════════════════════╗');
    console.error('║   ❌ Tests failed                                        ║');
    console.error('╚══════════════════════════════════════════════════════════╝\n');

    if (error.message.includes('401')) {
      console.error('🔐 Authentication Error:');
      console.error('   - Check your MIXPANEL_SERVICE_ACCOUNT_USERNAME');
      console.error('   - Check your MIXPANEL_SERVICE_ACCOUNT_SECRET');
      console.error('   - Make sure there are no extra spaces\n');
    } else if (error.message.includes('403')) {
      console.error('🚫 Permission Error:');
      console.error('   - Service Account needs "Projects: Read" scope');
      console.error('   - Service Account needs "Saved Reports: Read" scope');
      console.error('   - Check scopes in Organization Settings\n');
    } else if (error.message.includes('404')) {
      console.error('🔍 Not Found Error:');
      console.error(`   - Project ID ${projectId} may not exist`);
      console.error('   - Service Account may not have access to this project\n');
    }

    console.error('📚 For help, see: docs/MIXPANEL_SERVICE_ACCOUNT_SETUP.md\n');
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { testProjectAccess, testSavedReportsAccess };
