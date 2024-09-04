import Test from "@/features/test/Test";

export async function getStaticProps() {
  const locale = "es";

  return {
    props: {
      // You can get the messages from anywhere you like. The recommended pattern
      // is to put them in JSON files separated by locale (e.g. `en.json`).
      messages: (await import(`../../messages/${locale}.json`)).default,
    },
  };
}

function Page() {
  return <Test />;
}

Page.auth = {
  modules: [],
  loading: <div>Loading...</div>,
  unauthorized: "/auth/signin",
};

export default Page;
