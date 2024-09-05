import CompaniesForm from "@/features/companies/CompaniesForm";

export async function getServerSideProps() {
  const locale = "es";
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  };
}

function Page() {
  return <CompaniesForm />;
}

Page.auth = {
  modules: [],
  loading: <div>Loading...</div>,
  unauthorized: "/auth/signin",
};

export default Page;
