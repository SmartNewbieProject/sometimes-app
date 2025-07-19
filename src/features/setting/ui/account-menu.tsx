import { useRouter } from "expo-router";
import React from "react";
import Menu from "./menu";

function AccountMenu() {
  const router = useRouter();
  return (
    <Menu
      title="계정"
      options={[
        {
          text: "계정 관리",
          onClick: () => router.navigate("/setting/account"),
        },
      ]}
    />
  );
}

export default AccountMenu;
