import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export default function useReactTableLang() {
  const { t } = useTranslation();
  return useMemo(
    () => ({
      noItemsToShow: t("no_items_to_show")
    }),
    [t]
  );
}
