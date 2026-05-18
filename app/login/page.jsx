import dynamic from 'next/dynamic';
import AuthPageLayout from '../../components/AuthPageLayout.jsx';
import AuthFormSkeleton from '../../components/AuthFormSkeleton.jsx';

const LoginForm = dynamic(() => import('../../components/LoginForm.jsx'), {
  loading: () => <AuthFormSkeleton />,
});

export default function LoginPage() {
  return (
    <AuthPageLayout>
      <LoginForm />
    </AuthPageLayout>
  );
}
