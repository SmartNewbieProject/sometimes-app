import { ScrollViewStyleReset } from "expo-router/html";

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        {/* SEO Meta Tags - 대학생 소개팅/연애 키워드 최적화 */}
        <title>썸타임 - 대학생 소개팅 앱 | 대학생 연애 매칭 서비스</title>
        <meta name="description" content="대학생 소개팅 앱 썸타임! 4,000명+ 대학생이 선택한 연애 매칭 서비스. AI가 이상형을 분석해 같은 지역 대학생과 매칭해드려요. 대학생 연애, 캠퍼스 커플의 시작은 썸타임에서." />
        <meta name="keywords" content="대학생 소개팅, 대학생 연애, 대학생 소개팅 앱, 캠퍼스 커플, 대학교 소개팅, 대학생 매칭, 20대 소개팅, 대학생 만남, 썸타임" />
        <link rel="canonical" href="https://some-in-univ.com" />

        {/* Open Graph */}
        <meta property="og:title" content="썸타임 - 대학생 소개팅 앱 | 대학생 연애 매칭" />
        <meta property="og:description" content="4,000명+ 대학생이 선택한 소개팅 앱. AI 이상형 매칭으로 같은 지역 대학생과 설레는 만남을 시작하세요." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://some-in-univ.com" />
        <meta property="og:image" content="https://some-in-univ.com/opengraph.webp" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="썸타임" />
        <meta property="og:locale" content="ko_KR" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="썸타임 - 대학생 소개팅 앱" />
        <meta name="twitter:description" content="대학생 연애의 시작, 썸타임. AI 매칭으로 이상형 대학생을 만나보세요." />
        <meta name="twitter:image" content="https://some-in-univ.com/opengraph.webp" />

        {/* 추가 SEO 메타 */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="스마트 뉴비" />
        <meta name="application-name" content="썸타임" />
        <meta name="theme-color" content="#8B5CF6" />

        {/* JSON-LD 구조화 데이터 */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MobileApplication",
          "name": "썸타임",
          "description": "대학생을 위한 AI 소개팅 매칭 앱. 같은 지역 대학생과 설레는 연애를 시작하세요.",
          "applicationCategory": "SocialNetworkingApplication",
          "operatingSystem": "iOS, Android",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "KRW"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "500"
          },
          "author": {
            "@type": "Organization",
            "name": "스마트 뉴비",
            "url": "https://some-in-univ.com"
          }
        })}} />

        {/* DNS Prefetch & Preconnect for faster resource loading */}
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Preload critical font for LCP optimization */}
        <link
          rel="preload"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/woff2/PretendardVariable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {/* Non-blocking font CSS loading */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
          media="print"
          onLoad={"this.media='all'" as unknown as React.ReactEventHandler<HTMLLinkElement>}
        />
        <noscript>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
        </noscript>

        {/* Rubik & M PLUS 1p - Non-blocking with display=swap */}
        <link
          href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&family=M+PLUS+1p:wght@400;500;700&display=swap"
          rel="stylesheet"
          media="print"
          onLoad={"this.media='all'" as unknown as React.ReactEventHandler<HTMLLinkElement>}
        />
        <noscript>
          <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&family=M+PLUS+1p:wght@400;500;700&display=swap" rel="stylesheet" />
        </noscript>

        <ScrollViewStyleReset />

        {/* Critical CSS - 초기 렌더링용 인라인 스타일 */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Critical CSS for FCP */
              html, body { margin: 0; padding: 0; background-color: #FFFFFF; }
              body { font-family: 'Pretendard Variable', -apple-system, BlinkMacSystemFont, system-ui, sans-serif; }

              /* Loading skeleton placeholder */
              .loading-skeleton {
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
                color: white;
                font-size: 24px;
                font-weight: 600;
              }

              /* 웹 폰트 매핑 - font-display: swap 추가 */
              @font-face { font-family: 'Pretendard-Thin'; src: local('Pretendard Variable'); font-weight: 100; font-display: swap; }
              @font-face { font-family: 'Pretendard-ExtraLight'; src: local('Pretendard Variable'); font-weight: 200; font-display: swap; }
              @font-face { font-family: 'Pretendard-Light'; src: local('Pretendard Variable'); font-weight: 300; font-display: swap; }
              @font-face { font-family: 'Pretendard-Regular'; src: local('Pretendard Variable'); font-weight: 400; font-display: swap; }
              @font-face { font-family: 'Pretendard-Medium'; src: local('Pretendard Variable'); font-weight: 500; font-display: swap; }
              @font-face { font-family: 'Pretendard-SemiBold'; src: local('Pretendard Variable'); font-weight: 600; font-display: swap; }
              @font-face { font-family: 'Pretendard-Bold'; src: local('Pretendard Variable'); font-weight: 700; font-display: swap; }
              @font-face { font-family: 'Pretendard-ExtraBold'; src: local('Pretendard Variable'); font-weight: 800; font-display: swap; }
              @font-face { font-family: 'Pretendard-Black'; src: local('Pretendard Variable'); font-weight: 900; font-display: swap; }
              @font-face { font-family: 'Rubik'; src: local('Rubik'); font-weight: 400; font-display: swap; }
              @font-face { font-family: 'Rubik-Light'; src: local('Rubik'); font-weight: 300; font-display: swap; }
              @font-face { font-family: 'Rubik-Medium'; src: local('Rubik'); font-weight: 500; font-display: swap; }
              @font-face { font-family: 'Rubik-SemiBold'; src: local('Rubik'); font-weight: 600; font-display: swap; }
              @font-face { font-family: 'Rubik-Bold'; src: local('Rubik'); font-weight: 700; font-display: swap; }
              @font-face { font-family: 'MPLUS1p-Thin'; src: local('M PLUS 1p'); font-weight: 100; font-display: swap; }
              @font-face { font-family: 'MPLUS1p-Light'; src: local('M PLUS 1p'); font-weight: 300; font-display: swap; }
              @font-face { font-family: 'MPLUS1p-Regular'; src: local('M PLUS 1p'); font-weight: 400; font-display: swap; }
              @font-face { font-family: 'MPLUS1p-Medium'; src: local('M PLUS 1p'); font-weight: 500; font-display: swap; }
              @font-face { font-family: 'MPLUS1p-Bold'; src: local('M PLUS 1p'); font-weight: 700; font-display: swap; }
              @font-face { font-family: 'MPLUS1p-ExtraBold'; src: local('M PLUS 1p'); font-weight: 800; font-display: swap; }
              @font-face { font-family: 'MPLUS1p-Black'; src: local('M PLUS 1p'); font-weight: 900; font-display: swap; }
              @font-face { font-family: 'Gmarket-Sans-Light'; src: local('GmarketSans'); font-weight: 300; font-display: swap; }
              @font-face { font-family: 'Gmarket-Sans-Medium'; src: local('GmarketSans'); font-weight: 500; font-display: swap; }
              @font-face { font-family: 'Gmarket-Sans-Bold'; src: local('GmarketSans'); font-weight: 700; font-display: swap; }
              @font-face { font-family: 'StyleScript'; src: local('StyleScript'), local('cursive'); font-display: swap; }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
