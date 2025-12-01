import FeedListScreen from "./feed-common-screen";
export default function MyArticlesScreen() {
  return (
    <FeedListScreen title="내가 작성한 게시글" type="articles" pageSize={10} />
  );
}
