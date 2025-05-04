import { useForm } from "react-hook-form";
import { ArticleRequestType } from "../../types";

export type ArticleWriterForm = {
  title: string;
  content: string;
  anonymous: boolean;
  type: ArticleRequestType;
};

export const useArticleWriteForm = (category: ArticleRequestType) => {
  const form = useForm<ArticleWriterForm>({
    defaultValues: {
      title: '',
      content: '',
      anonymous: true,
      type: category,
    },
  });

  return form;
};
