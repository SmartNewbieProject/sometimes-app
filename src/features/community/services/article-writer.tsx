import { FormProvider } from 'react-hook-form';
import type { useArticleWriteForm } from '../hooks/article-writer';

type FormProviderProps = {
	children: React.ReactNode;
	form: ReturnType<typeof useArticleWriteForm>;
};

export const ArticleWriteFormProvider = ({ children, form }: FormProviderProps) => {
	return <FormProvider {...form}>{children}</FormProvider>;
};
