import FeedListScreen from "./feed-common-screen";
export default function MyCommentsScreen() {
  return (
    <FeedListScreen
      title="내가 댓글을 작성한 게시글"
      type="comments"
      pageSize={10}
    />
  );
}
