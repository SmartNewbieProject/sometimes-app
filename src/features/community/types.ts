export interface Author {
  id: number;
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
  id: number;
  content: string;
  createdAt: string;
  author: Author;
  articleId: number;
}

export interface Article {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  author: Author;
  likes: number;
  views: number;
  comments?: Comment[];
} 