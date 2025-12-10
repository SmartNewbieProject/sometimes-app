import FeedListScreen from "./feed-common-screen";
import { useTranslation } from "react-i18next";

export default function MyCommentsScreen() {
  const { t } = useTranslation();
  return (
    <FeedListScreen
      title={t('features.mypage.my_activity.comments_title')}
      type="comments"
      pageSize={10}
    />
  );
}
