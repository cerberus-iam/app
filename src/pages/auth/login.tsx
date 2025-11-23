import type { GetServerSideProps } from 'next';
import Head from 'next/head';

import { LoginForm } from '@/components/login-form';
import { AuthLayout } from '@/layouts/auth';
import { redirectIfAuthenticated } from '@/lib/auth/redirects';

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Sign In | Cerberus IAM</title>
      </Head>
      <AuthLayout>
        <LoginForm />
      </AuthLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) =>
  redirectIfAuthenticated(context);
