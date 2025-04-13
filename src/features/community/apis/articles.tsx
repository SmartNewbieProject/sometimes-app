import { axiosClient } from "@/src/shared/libs";

export type Article = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    name: string;
    email: string;
  };
}

type PostArticleBody = {
  content: string;
  anonymous: boolean;
}

type getArticleParams = {
  page: number;
  size: number;
}

type PatchArticleBody = {
  content: string;
  anonymous: boolean;
}

type DeleteArticle = {
  id: number;
}

export const getAllArticles = async (params: getArticleParams): Promise<Article[]> => {
  return axiosClient.get('/articles', { params });
};

export const postArticles = async (body: PostArticleBody): Promise<Article> => {
  return axiosClient.post('/articles', body);
};

export const getArticle = async (articleId: number): Promise<Article> => {
  return axiosClient.get(`/articles/${articleId}`);
};

export const patchArticle = async (articleId: number, body: PatchArticleBody): Promise<Article> => {
  return axiosClient.patch(`/articles/${articleId}`, body);
};

export const deleteArticle = async (articleId: number): Promise<Article> => {
  return axiosClient.delete(`/articles/${articleId}`);
};

export const patchArticleLike = async (articleId: number): Promise<Article> => {
  return axiosClient.patch(`/articles/${articleId}/like`);
};

type Service = {
  getAllArticles: (params: getArticleParams) => Promise<Article[]>;
  postArticles: (body: PostArticleBody) => Promise<Article>;
  getArticle: (articleId: number) => Promise<Article>;
  patchArticle: (articleId: number, body: PatchArticleBody) => Promise<Article>;
  deleteArticle: (articleId: number) => Promise<Article>;
  patchArticleLike: (articleId: number) => Promise<Article>;
}

const apis: Service = {
  getAllArticles,
  postArticles,
  getArticle,
  patchArticle,
  deleteArticle,
  patchArticleLike,
};

export default apis;



