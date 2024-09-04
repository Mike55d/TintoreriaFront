import Login from "@/features/login/Login";
import { GetStaticProps } from "next";
import React from "react";

export async function getStaticProps() {
  const locale = "es";

  return {
    props: {
      // You can get the messages from anywhere you like. The recommended pattern
      // is to put them in JSON files separated by locale (e.g. `en.json`).
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  };
}

function Page() {
  return <Login />;
}

export default Page;
