import FeedListScreen from "./feed-common-screen";
export default function MyLikeScreen() {
  return (
    <FeedListScreen title="내가 좋아요한 게시글" type="likes" pageSize={10} />
  );
}
