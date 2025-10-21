import { useForm } from 'react-hook-form';
import { ArticleRequestType } from '../../types';

export type ArticleWriterForm = {
  title: string;
  content: string;
  anonymous: boolean;
  type: ArticleRequestType;
  images?: string[];
  originalImages?: { id: string; imageUrl: string; displayOrder: number; }[];
  deleteImageIds?: string[];
};

export const useArticleWriteForm = (data: Partial<ArticleWriterForm>) => {
  const form = useForm<ArticleWriterForm>({
    defaultValues: {
      anonymous: data?.anonymous || true,
      content: data?.content || '',
      title: data?.title || '',
      type: data?.type || ArticleRequestType.GENERAL,
      images: data?.images || [],
      originalImages: data?.originalImages || [],
      deleteImageIds: data?.deleteImageIds || [],
    },
  });

  return form;
};
