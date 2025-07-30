import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { authService } from '../services/auth';
import { getErrorMessage } from '../services/api';

// Validation schema
const schema = yup.object({
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Email must be a valid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  firstName: yup.string().max(100, 'First name must not exceed 100 characters'),
  lastName: yup.string().max(100, 'Last name must not exceed 100 characters'),
});

type FormData = yup.InferType<typeof schema>;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.register({
        username: data.username,
        email: data.email,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
      });

      setSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      {success && (
        <div className="success-message">
          Registration successful! Redirecting to login...
        </div>
      )}
      {error && (
        <div className="error-alert">{error}</div>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="username">Username *</label>
          <input
            type="text"
            id="username"
            {...register('username')}
            disabled={isLoading}
          />
          {errors.username && (
            <span className="error-message">
              {errors.username.message}
            </span>
          )}
        </div>

        <div>
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            {...register('email')}
            disabled={isLoading}
          />
          {errors.email && (
            <span className="error-message">
              {errors.email.message}
            </span>
          )}
        </div>

        <div>
          <label htmlFor="password">Password *</label>
          <input
            type="password"
            id="password"
            {...register('password')}
            disabled={isLoading}
          />
          {errors.password && (
            <span className="error-message">
              {errors.password.message}
            </span>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword">Confirm Password *</label>
          <input
            type="password"
            id="confirmPassword"
            {...register('confirmPassword')}
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <span className="error-message">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        <div>
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            {...register('firstName')}
            disabled={isLoading}
          />
          {errors.firstName && (
            <span className="error-message">
              {errors.firstName.message}
            </span>
          )}
        </div>

        <div>
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            {...register('lastName')}
            disabled={isLoading}
          />
          {errors.lastName && (
            <span className="error-message">
              {errors.lastName.message}
            </span>
          )}
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default Register;