import { Article } from '../apis/articles';

export const mockArticles: Article[] = [
  {
    id: 1,
    title: '첫 번째 게시글',
    content: '안녕하세요! 첫 번째 게시글입니다.',
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
    author: {
      id: 1,
      name: '홍길동',
      email: 'hong@example.com'
    }
  },
  {
    id: 2,
    title: '두 번째 게시글',
    content: '반갑습니다! 두 번째 게시글입니다.',
    createdAt: '2024-03-20T11:00:00Z',
    updatedAt: '2024-03-20T11:00:00Z',
    author: {
      id: 2,
      name: '김철수',
      email: 'kim@example.com'
    }
  },
  {
    id: 3,
    title: '세 번째 게시글',
    content: '잘 부탁드립니다! 세 번째 게시글입니다.',
    createdAt: '2024-03-20T12:00:00Z',
    updatedAt: '2024-03-20T12:00:00Z',
    author: {
      id: 3,
      name: '이영희',
      email: 'lee@example.com'
    }
  }
];

export const mockComments = [
  {
    id: 1,
    articleId: 1,
    content: '첫 번째 게시글의 첫 번째 댓글입니다.',
    createdAt: '2024-03-20T10:30:00Z',
    updatedAt: '2024-03-20T10:30:00Z',
    author: {
      id: 2,
      name: '김철수',
      email: 'kim@example.com'
    }
  },
  {
    id: 2,
    articleId: 1,
    content: '첫 번째 게시글의 두 번째 댓글입니다.',
    createdAt: '2024-03-20T10:45:00Z',
    updatedAt: '2024-03-20T10:45:00Z',
    author: {
      id: 3,
      name: '이영희',
      email: 'lee@example.com'
    }
  },
  {
    id: 3,
    articleId: 2,
    content: '두 번째 게시글의 첫 번째 댓글입니다.',
    createdAt: '2024-03-20T11:30:00Z',
    updatedAt: '2024-03-20T11:30:00Z',
    author: {
      id: 1,
      name: '홍길동',
      email: 'hong@example.com'
    }
  }
]; 