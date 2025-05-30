import { axiosClient } from "@/src/shared/libs";
import type { Article, ArticleRequestType, Category } from "../types";
import type { PaginatedResponse } from "@/src/types/server";

type Id = {
  id: string;
}

type PostArticleBody = {
  title: string;
  content: string;
  type: ArticleRequestType;
}

type getArticleParams = {
  page: number;
  size: number;
}

type GetArticleParams = getArticleParams & {
  code: string;
};

type PatchArticleBody = {
  content: string;
  title: string;
}

type DeleteArticle = {
  id: string;
}

export const reportArticle = async (articleId: string, reason: string): Promise<void> =>
   axiosClient.post(`/articles/${articleId}/reports`, { reason });

type GetArticleResponse = PaginatedResponse<Article>;

export const getAllArticles = async (params: getArticleParams): Promise<Article[]> => {
  return axiosClient.get('/articles', { params });
};

export const postArticles = async (body: PostArticleBody): Promise<Article> => {
  return axiosClient.post('/articles', body);
};

export const getArticle = async (articleId: string): Promise<Article> => {
  return axiosClient.get(`/articles/details/${articleId}`);
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

export const getCategoryList = (): Promise<Category[]> =>
  axiosClient.get('/articles/category/list');

export const getArticles = async ({ code, ...params }: GetArticleParams): Promise<GetArticleResponse> => {
  return axiosClient.get(`/articles/${code}`, { params });
};

export const doLike = async (data: Id): Promise<void> =>
  axiosClient.patch(`/articles/${data.id}/like`);

type Service = {
  getAllArticles: (params: getArticleParams) => Promise<Article[]>;
  postArticles: (body: PostArticleBody) => Promise<Article>;
  getArticle: (articleId: string) => Promise<Article>;
  patchArticle: (articleId: string, body: PatchArticleBody) => Promise<Article>;
  deleteArticle: (articleId: string) => Promise<Article>;
  patchArticleLike: (articleId: string) => Promise<Article>;
  getCategoryList: () => Promise<Category[]>;
  doLike: (params: Id) => Promise<void>;
  reportArticle: (articleId: string, reason: string) => Promise<void>;
}

const apis: Service = {
  getAllArticles,
  postArticles,
  getArticle,
  patchArticle,
  deleteArticle,
  patchArticleLike,
  getCategoryList,
  doLike,
  reportArticle,
};

export default apis;
