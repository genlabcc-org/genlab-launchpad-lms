import { useNavigate } from 'react-router-dom';
import { FolderX } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Button from './ui/Button';

export function NotFound() {
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuthStore();

  const handleGoHome = () => {
    if (isAuthenticated && userRole) {
      navigate(`/${userRole}/dashboard`, { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center flex flex-col items-center gap-6 p-8 rounded-3xl bg-card-bg border border-border-subtle shadow-2xl">
        <div className="size-20 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <FolderX className="w-10 h-10" />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-primary">404 Error</span>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Page Not Found</h1>
          <p className="text-sm text-muted">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>
        <Button variant="primary" onClick={handleGoHome} className="w-full max-w-[200px]">
          {isAuthenticated ? 'Back to Dashboard' : 'Back to Sign In'}
        </Button>
      </div>
    </div>
  );
}

export default NotFound;
