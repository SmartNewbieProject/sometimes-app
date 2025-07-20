import { useRouter } from "expo-router";
import Menu from "./menu";

function AccountMenu() {
  const router = useRouter();
  const options = [
    {
      text: "계정 관리",
      onClick: () => router.navigate("/setting/account"),
    },
  ];
  return <Menu title="계정" options={options} />;
}

export default AccountMenu;
