import FeedListScreen from "./feed-common-screen";
import { useTranslation } from "react-i18next";

export default function MyLikeScreen() {
  const { t } = useTranslation();
  return (
    <FeedListScreen title={t('features.mypage.my_activity.liked_title')} type="likes" pageSize={10} />
  );
}
