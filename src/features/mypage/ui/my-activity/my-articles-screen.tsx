import FeedListScreen from "./feed-common-screen";
import { useTranslation } from "react-i18next";

export default function MyArticlesScreen() {
  const { t } = useTranslation();
  return (
    <FeedListScreen title={t('features.mypage.my_activity.articles_title')} type="articles" pageSize={10} />
  );
}
