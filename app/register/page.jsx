import dynamic from 'next/dynamic';
import AuthPageLayout from '../../components/AuthPageLayout.jsx';
import AuthFormSkeleton from '../../components/AuthFormSkeleton.jsx';

const RegisterForm = dynamic(() => import('../../components/RegisterForm.jsx'), {
  loading: () => <AuthFormSkeleton />,
});

export default function RegisterPage() {
  return (
    <AuthPageLayout>
      <RegisterForm />
    </AuthPageLayout>
  );
}
