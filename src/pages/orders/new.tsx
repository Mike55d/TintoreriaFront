import OrdersForm from "@/features/orders/OrdersForm";

export async function getServerSideProps() {
  const locale = "es";
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  };
}

function Page() {
  return <OrdersForm />;
}

Page.auth = {
  modules: [],
  loading: <div>Loading...</div>,
  unauthorized: "/auth/signin",
};

export default Page;
