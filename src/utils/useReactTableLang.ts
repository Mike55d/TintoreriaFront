import { useTranslations } from "next-intl";
import { useMemo } from "react";

export default function useReactTableLang() {
  const t = useTranslations();

  return useMemo(
    () => ({
      noItemsToShow: t("no_items_to_show"),
    }),
    [t]
  );
}
