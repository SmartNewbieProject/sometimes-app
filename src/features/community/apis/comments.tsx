import { axiosClient } from '@/src/shared/libs';
import type { Comment } from '../types';

type CommentParams = {
	articleId: string;
};

type PostCommentBody = {
	content: string;
	anonymous: boolean;
};

type PatchCommentBody = {
	content: string;
};

type Id = {
	id: string;
};

export const getComments = async (params: CommentParams): Promise<Comment[]> => {
	return axiosClient.get(`/articles/${params.articleId}/comments`, { params });
};

export const postComments = async (articleId: string, body: PostCommentBody): Promise<Comment> => {
	return axiosClient.post(`/articles/${articleId}/comments`, body);
};

export const patchComments = async (
	articleId: string,
	commentId: string,
	body: PatchCommentBody,
): Promise<Comment> => {
	return axiosClient.patch(`/articles/${articleId}/comments/${commentId}`, body);
};

export const deleteComments = async (articleId: string, commentId: string): Promise<Comment> => {
	return axiosClient.delete(`/articles/${articleId}/comments/${commentId}`);
};

type Service = {
	getComments: (params: CommentParams) => Promise<Comment[]>;
	postComments: (articleId: string, body: PostCommentBody) => Promise<Comment>;
	patchComments: (articleId: string, commentId: string, body: PatchCommentBody) => Promise<Comment>;
	deleteComments: (articleId: string, commentId: string) => Promise<Comment>;
};

const apis: Service = {
	getComments,
	postComments,
	patchComments,
	deleteComments,
};

export default apis;
