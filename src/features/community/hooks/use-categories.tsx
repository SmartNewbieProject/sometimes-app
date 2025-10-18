import { useQuery } from "@tanstack/react-query";
import apis from "../apis";
import { create } from "zustand";
import { useEffect } from "react";

const HOME_CODE = "__home__";

interface State {
  category?: string;
  changeCategory: (categories: string) => void;
}

const useStore = create<State>((set) => ({
  changeCategory: (category) => set({ category }),
}));

export const useCategory = () => {
  const { category, changeCategory } = useStore();
  const { data: categories = [], ...queryProps } = useQuery({
    queryKey: ["category-list"],
    queryFn: apis.articles.getCategoryList,
  });

  useEffect(() => {
    if (category) return;
    //changeCategory(categories[0]?.code);
    changeCategory(HOME_CODE);
  }, [queryProps.isFetched]);

  return {
    categories,
    currentCategory: category,
    changeCategory,
    ...queryProps,
  };
};
