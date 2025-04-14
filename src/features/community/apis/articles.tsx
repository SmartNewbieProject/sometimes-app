import { axiosClient } from "@/src/shared/libs";
import { Article } from "../types";



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
  id: string;
}

export const getAllArticles = async (params: getArticleParams): Promise<Article[]> => {
  return axiosClient.get('/articles', { params });
};

export const postArticles = async (body: PostArticleBody): Promise<Article> => {
  return axiosClient.post('/articles', body);
};

export const getArticle = async (articleId: string): Promise<Article> => {
  return axiosClient.get(`/articles/${articleId}`);
};

export const patchArticle = async (articleId: string, body: PatchArticleBody): Promise<Article> => {
  return axiosClient.patch(`/articles/${articleId}`, body);
};

export const deleteArticle = async (articleId: string): Promise<Article> => {
  return axiosClient.delete(`/articles/${articleId}`);
};

export const patchArticleLike = async (articleId: string): Promise<Article> => {
  return axiosClient.patch(`/articles/${articleId}/like`);
};

type Service = {
  getAllArticles: (params: getArticleParams) => Promise<Article[]>;
  postArticles: (body: PostArticleBody) => Promise<Article>;
  getArticle: (articleId: string) => Promise<Article>;
  patchArticle: (articleId: string, body: PatchArticleBody) => Promise<Article>;
  deleteArticle: (articleId: string) => Promise<Article>;
  patchArticleLike: (articleId: string) => Promise<Article>;
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



