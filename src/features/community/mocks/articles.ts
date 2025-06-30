import { Article } from '../types';

export const mockArticles: Article[] = [
  {
    id: '1',
    title: '첫 번째 게시글',
    content: '안녕하세요! 첫 번째 게시글입니다.',
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    author: {
      id: '1',
      name: '홍길동',
      email: 'hong@example.com',
      age: 25,
      university: { name: '서울대학교', image: require('@/assets/images/univ.png') }
    },
    likes: 0,
    views: 0
  },
  {
    id: '2',
    title: '두 번째 게시글',
    content: '반갑습니다! 두 번째 게시글입니다.',
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    author: {
      id: '2',
      name: '김철수',
      email: 'kim@example.com',
      age: 23,
      university: { name: '연세대학교', image: require('@/assets/images/univ.png') }
    },
    likes: 0,
    views: 0
  },
  {
    id: '3',
    title: '세 번째 게시글',
    content: '잘 부탁드립니다! 세 번째 게시글입니다.',
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    author: {
      id: '3',
      name: '이영희',
      email: 'lee@example.com',
      age: 27,
      university: { name: '고려대학교', image: require('@/assets/images/univ.png') }
    },
    likes: 0,
    views: 0
  }
];

export const mockPopularArticles: Article[] = [
  {
    id: '4',
    title: '토끼는 귀여워',
    content: '토끼는 귀엽다. 토끼는 깡총깡총 뛰어다닌다. 토끼는 당근을 좋아한다.',
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    author: {
      id: '4',
      name: '토끼러버',
      email: 'rabbit@example.com',
      age: 22,
      university: { name: '서울대학교', image: require('@/assets/images/univ.png') }
    },
    likes: 10,
    views: 5
  },
  {
    id: '5',
    title: '오늘 진짜 신기한일 있었음',
    content: '아니 진짜 대박. 오늘 학교 가는데 별이 떨어지는걸 봤어요. 진짜에요!!',
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    author: {
      id: '5',
      name: '별덕후',
      email: 'star@example.com',
      age: 24,
      university: { name: '서울대학교', image: require('@/assets/images/univ.png') }
    },
    likes: 15,
    views: 8
  }
];

export const mockComments = [
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    articleId: '1',
    content: '첫 번째 게시글의 첫 번째 댓글입니다.',
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    author: {
      id: 'c9bf9e57-1685-4c89-bafb-ff5af830be8a',
      name: '김철수',
      email: 'kim@example.com',
      age: 20,
      university: {
        name: '서울대학교',
        image: require('@/assets/images/univ.png')
      }
    }
  },
  {
    id: '9f8b7e2b-4c3b-4f2b-8f3b-2f3b4f2b3f4b',
    articleId: '1',
    content: '첫 번째 게시글의 두 번째 댓글입니다.',
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    author: {
      id: 'b2f9e2b7-4c3b-4f2b-8f3b-2f3b4f2b3f4b',
      name: '이영희',
      email: 'lee@example.com',
      age: 20,
      university: {
        name: '서울대학교',
        image: require('@/assets/images/univ.png')
      }
    }
  },
  {
    id: '3f4b2f9e-2b7e-4c3b-4f2b-8f3b2f3b4f2b',
    articleId: '2',
    content: '두 번째 게시글의 첫 번째 댓글입니다.',
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    author: {
      id: 'a2b3f4b2-9e2b-7e4c-3b4f-2b8f3b2f3b4f',
      name: '홍길동',
      email: 'hong@example.com',
      age: 20,
      university: {
        name: '서울대학교',
        image: require('@/assets/images/univ.png')
      }
    }
  },
  {
    id: '4f2b3f4b-2f9e-2b7e-4c3b-4f2b8f3b2f3b',
    articleId: '4',
    content: '토끼 너무 귀여워요 ㅠㅠ',
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    author: {
      id: 'b2f3b4f2-9e2b-7e4c-3b4f-2b8f3b2f3b4f',
      name: '토끼팬',
      email: 'rabbitfan@example.com',
      age: 20,
      university: {
        name: '서울대학교',
        image: require('@/assets/images/univ.png')
      }
    }
  },
  {
    id: '5f2b3f4b-2f9e-2b7e-4c3b-4f2b8f3b2f3b',
    articleId: '5',
    content: '진짜요?? 저도 보고 싶었는데!!',
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    author: {   
      id: 'c2f3b4f2-9e2b-7e4c-3b4f-2b8f3b2f3b4f',
      name: '별구경러',
      email: 'stargazer@example.com',
      age: 20,
      university: {
        name: '서울대학교',
        image: require('@/assets/images/univ.png')
      }
    }
  },
  {
    id: '6f2b3f4b-2f9e-2b7e-4c3b-4f2b8f3b2f3b',
    articleId: '1',
    content: '첫 번째 댓글에 대한 대댓글입니다.',
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    author: {
      id: 'd2f3b4f2-9e2b-7e4c-3b4f-2b8f3b2f3b4f',
      name: '이영희',
      email: 'lee@example.com',
      age: 20,
      university: {
        name: '서울대학교',
        image: require('@/assets/images/univ.png')
      }
    },
    repliesid: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
  }
]; 

