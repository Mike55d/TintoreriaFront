import CompaniesList from "@/features/companies/CompaniesList";

export async function getServerSideProps() {
  const locale = "es";
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  };
}

function Page() {
  return <CompaniesList />;
}

Page.auth = {
  modules: [],
  loading: <div>Loading...</div>,
  unauthorized: "/auth/signin",
};

export default Page;
