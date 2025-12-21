import { ScrollViewStyleReset } from "expo-router/html";

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, maximum-scale=1, user-scalable=no"
        />

        {/* SEO Meta Tags */}
        <title>썸타임 - 대학생 소개팅 앱</title>
        <meta name="description" content="대학생을 위한 지역기반 소개팅 앱 썸타임. 같은 대학, 다른 대학 학생들과 설레는 만남을 시작하세요." />
        <meta property="og:title" content="썸타임 - 대학생 소개팅 앱" />
        <meta property="og:description" content="대학생을 위한 지역기반 소개팅 앱 썸타임. 같은 대학, 다른 대학 학생들과 설레는 만남을 시작하세요." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://some-in-univ.com" />
        <meta property="og:image" content="https://some-in-univ.com/opengraph.png" />
        <meta property="og:site_name" content="썸타임" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="썸타임 - 대학생 소개팅 앱" />
        <meta name="twitter:description" content="대학생을 위한 지역기반 소개팅 앱 썸타임." />
        <meta name="twitter:image" content="https://some-in-univ.com/opengraph.png" />

        {/* Pretendard 웹폰트 (Variable) - CDN */}
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />

        {/* Rubik - Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&family=M+PLUS+1p:wght@100;300;400;500;700;800;900&display=swap"
          rel="stylesheet"
        />

        <ScrollViewStyleReset />

        {/* 웹 폰트 매핑 CSS */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @font-face { font-family: 'Pretendard-Thin'; src: local('Pretendard Variable'); font-weight: 100; }
              @font-face { font-family: 'Pretendard-ExtraLight'; src: local('Pretendard Variable'); font-weight: 200; }
              @font-face { font-family: 'Pretendard-Light'; src: local('Pretendard Variable'); font-weight: 300; }
              @font-face { font-family: 'Pretendard-Regular'; src: local('Pretendard Variable'); font-weight: 400; }
              @font-face { font-family: 'Pretendard-Medium'; src: local('Pretendard Variable'); font-weight: 500; }
              @font-face { font-family: 'Pretendard-SemiBold'; src: local('Pretendard Variable'); font-weight: 600; }
              @font-face { font-family: 'Pretendard-Bold'; src: local('Pretendard Variable'); font-weight: 700; }
              @font-face { font-family: 'Pretendard-ExtraBold'; src: local('Pretendard Variable'); font-weight: 800; }
              @font-face { font-family: 'Pretendard-Black'; src: local('Pretendard Variable'); font-weight: 900; }
              @font-face { font-family: 'Rubik'; src: local('Rubik'); font-weight: 400; }
              @font-face { font-family: 'Rubik-Light'; src: local('Rubik'); font-weight: 300; }
              @font-face { font-family: 'Rubik-Medium'; src: local('Rubik'); font-weight: 500; }
              @font-face { font-family: 'Rubik-SemiBold'; src: local('Rubik'); font-weight: 600; }
              @font-face { font-family: 'Rubik-Bold'; src: local('Rubik'); font-weight: 700; }
              @font-face { font-family: 'MPLUS1p-Thin'; src: local('M PLUS 1p'); font-weight: 100; }
              @font-face { font-family: 'MPLUS1p-Light'; src: local('M PLUS 1p'); font-weight: 300; }
              @font-face { font-family: 'MPLUS1p-Regular'; src: local('M PLUS 1p'); font-weight: 400; }
              @font-face { font-family: 'MPLUS1p-Medium'; src: local('M PLUS 1p'); font-weight: 500; }
              @font-face { font-family: 'MPLUS1p-Bold'; src: local('M PLUS 1p'); font-weight: 700; }
              @font-face { font-family: 'MPLUS1p-ExtraBold'; src: local('M PLUS 1p'); font-weight: 800; }
              @font-face { font-family: 'MPLUS1p-Black'; src: local('M PLUS 1p'); font-weight: 900; }
              @font-face { font-family: 'Gmarket-Sans-Light'; src: local('GmarketSans'); font-weight: 300; }
              @font-face { font-family: 'Gmarket-Sans-Medium'; src: local('GmarketSans'); font-weight: 500; }
              @font-face { font-family: 'Gmarket-Sans-Bold'; src: local('GmarketSans'); font-weight: 700; }
              @font-face { font-family: 'StyleScript'; src: local('StyleScript'), local('cursive'); }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
