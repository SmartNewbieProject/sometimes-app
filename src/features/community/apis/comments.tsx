import { axiosClient } from "@/src/shared/libs";

type Comment = {
  id: number;
  articleId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    name: string;
    email: string;
  };
}

type CommentParams = {
  articleId: number;
}

type PostCommentBody = {
  content: string;
  anonymous: boolean;
}

type PatchCommentBody = {
  content: string;
}



export const getComments = async (params: CommentParams): Promise<Comment[]> => {
  return axiosClient.get(`/articles/${params.articleId}/comments`, { params });
};

export const postComments = async (articleId: number, body: PostCommentBody): Promise<Comment> => {
  return axiosClient.post(`/articles/${articleId}/comments`, body);
};

export const patchComments = async (articleId: number, commentId: number, body: PatchCommentBody): Promise<Comment> => {
  return axiosClient.patch(`/articles/${articleId}/comments/${commentId}`, body);
};

export const deleteComments = async (articleId: number, commentId: number): Promise<Comment> => {
  return axiosClient.delete(`/articles/${articleId}/comments/${commentId}`);
};

type Service = {
  getComments: (params: CommentParams) => Promise<Comment[]>;
  postComments: (articleId: number, body: PostCommentBody) => Promise<Comment>;
  patchComments: (articleId: number, commentId: number, body: PatchCommentBody) => Promise<Comment>;
  deleteComments: (articleId: number, commentId: number) => Promise<Comment>;
}

const apis: Service = {
  getComments,
  postComments,
  patchComments,
  deleteComments,
};

export default apis;

