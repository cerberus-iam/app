import type { GetServerSideProps } from 'next';
import Head from 'next/head';

import { SignupForm } from '@/components/signup-form';
import { AuthLayout } from '@/layouts/auth';
import { redirectIfAuthenticated } from '@/lib/auth/redirects';

export default function SignupPage() {
  return (
    <>
      <Head>
        <title>Sign Up | Cerberus IAM</title>
      </Head>
      <AuthLayout>
        <SignupForm />
      </AuthLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) =>
  redirectIfAuthenticated(context);
