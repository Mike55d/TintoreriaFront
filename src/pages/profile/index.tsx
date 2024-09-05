import ProfileView from "@/features/users/ProfileView";

export async function getStaticProps() {
  const locale = "es";
  return {
    props: {
      messages: (await import(`../../../messages/${locale}.json`)).default,
    },
  };
}

function Page() {
  return <ProfileView />;
}

Page.auth = {
  modules: [],
  loading: <div>Loading...</div>,
  unauthorized: '/auth/signin'
};

export default Page;
