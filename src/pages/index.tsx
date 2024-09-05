import DashboardView from "@/components/DashboardView";

export async function getStaticProps() {
  const locale = "es";
  return {
    props: {
      messages: (await import(`../../messages/${locale}.json`)).default,
    },
  };
}

function Page() {
  return <DashboardView />;
}

Page.auth = {
  modules: [],
  loading: <div>Loading...</div>,
  unauthorized: "/auth/signin",
};

export default Page;
