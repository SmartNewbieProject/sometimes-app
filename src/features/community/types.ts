export interface Author {
  id: string;
  name: string;
  email: string;
  age: number;
  university: University;
}

export interface University {
  name: string;
  image: string;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: Author;
  articleId: string;
  repliesid?: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: Author;
  likes: number;
  views: number;
  comments?: Comment[];
} 