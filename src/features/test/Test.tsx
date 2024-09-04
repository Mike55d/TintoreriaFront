import { useTranslations } from "next-intl";

const Test = () => {
  const t = useTranslations("HomePage");
  return (
    <>
      <h1>{t("title")}</h1>
    </>
  );
};

export default Test;
