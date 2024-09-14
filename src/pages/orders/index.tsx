import OrdersList from "@/features/orders/OrdersList";

export async function getServerSideProps() {
  const locale = "es";
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  };
}

function Page() {
  return <OrdersList />;
}

Page.auth = {
  modules: [],
  loading: <div>Loading...</div>,
  unauthorized: "/auth/signin",
};

export default Page;
