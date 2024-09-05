import CLientsForm from "@/features/clients/ClientsForm";

export async function getServerSideProps() {
  const locale = "es";
  return {
    props: {
      messages: (await import(`../../../../messages/${locale}.json`)).default,
    },
  };
}

function Page() {
  return <CLientsForm />;
}

Page.auth = {
  modules: [],
  loading: <div>Loading...</div>,
  unauthorized: "/auth/signin",
};

export default Page;
