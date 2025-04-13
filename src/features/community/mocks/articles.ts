import { Article } from '../types';

export const mockArticles: Article[] = [
  {
    id: 1,
    title: '첫 번째 게시글',
    content: '안녕하세요! 첫 번째 게시글입니다.',
    createdAt: '2024-03-20T10:00:00Z',
    author: {
      id: 1,
      name: '홍길동',
      email: 'hong@example.com',
      age: 25,
      university: { name: '서울대학교', image: require('@/assets/images/univ.png') }
    },
    likes: 0,
    shares: 0
  },
  {
    id: 2,
    title: '두 번째 게시글',
    content: '반갑습니다! 두 번째 게시글입니다.',
    createdAt: '2024-03-20T11:00:00Z',
    author: {
      id: 2,
      name: '김철수',
      email: 'kim@example.com',
      age: 23,
      university: { name: '연세대학교', image: require('@/assets/images/univ.png') }
    },
    likes: 0,
    shares: 0
  },
  {
    id: 3,
    title: '세 번째 게시글',
    content: '잘 부탁드립니다! 세 번째 게시글입니다.',
    createdAt: '2024-03-20T12:00:00Z',
    author: {
      id: 3,
      name: '이영희',
      email: 'lee@example.com',
      age: 27,
      university: { name: '고려대학교', image: require('@/assets/images/univ.png') }
    },
    likes: 0,
    shares: 0
  }
];

export const mockPopularArticles: Article[] = [
  {
    id: 4,
    title: '토끼는 귀여워',
    content: '토끼는 귀엽다. 토끼는 깡총깡총 뛰어다닌다. 토끼는 당근을 좋아한다.',
    createdAt: '2024-03-19T15:00:00Z',
    author: {
      id: 4,
      name: '토끼러버',
      email: 'rabbit@example.com',
      age: 22,
      university: { name: '서울대학교', image: require('@/assets/images/univ.png') }
    },
    likes: 10,
    shares: 5
  },
  {
    id: 5,
    title: '오늘 진짜 신기한일 있었음',
    content: '아니 진짜 대박. 오늘 학교 가는데 별이 떨어지는걸 봤어요. 진짜에요!!',
    createdAt: '2024-03-19T18:00:00Z',
    author: {
      id: 5,
      name: '별덕후',
      email: 'star@example.com',
      age: 24,
      university: { name: '서울대학교', image: require('@/assets/images/univ.png') }
    },
    likes: 15,
    shares: 8
  }
];

export const mockComments = [
  {
    id: 1,
    articleId: 1,
    content: '첫 번째 게시글의 첫 번째 댓글입니다.',
    createdAt: '2024-03-20T10:30:00Z',
    author: {
      id: 2,
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
    id: 2,
    articleId: 1,
    content: '첫 번째 게시글의 두 번째 댓글입니다.',
    createdAt: '2024-03-20T10:45:00Z',
    author: {
      id: 3,
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
    id: 3,
    articleId: 2,
    content: '두 번째 게시글의 첫 번째 댓글입니다.',
    createdAt: '2024-03-20T11:30:00Z',
    author: {
      id: 1,
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
    id: 4,
    articleId: 4,
    content: '토끼 너무 귀여워요 ㅠㅠ',
    createdAt: '2024-03-19T15:10:00Z',
    author: {
      id: 6,
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
    id: 5,
    articleId: 5,
    content: '진짜요?? 저도 보고 싶었는데!!',
    createdAt: '2024-03-19T18:15:00Z',
    author: {
      id: 7,
      name: '별구경러',
      email: 'stargazer@example.com',
      age: 20,
      university: {
        name: '서울대학교',
        image: require('@/assets/images/univ.png')
      }
    }
  }
]; 

