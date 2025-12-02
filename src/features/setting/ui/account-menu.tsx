import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Menu from "./menu";

function AccountMenu() {
  const { t } = useTranslation();
  const router = useRouter();
  const options = [
    {
      text: t("features.setting.ui.menu.account_management"),
      onClick: () => router.navigate("/setting/account"),
    },
  ];
  return <Menu title={t("features.setting.ui.menu.account")} options={options} />;
}

export default AccountMenu;