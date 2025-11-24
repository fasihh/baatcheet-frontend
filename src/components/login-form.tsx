import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  // FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import loginMutation from "@/queries/user"
import { useUser } from "@/contexts/user"
import { useNavigate } from "react-router-dom"

type FormState = {
  username: string;
  displayName?: string;
  password: string;
  errors: string | null;
};

export function LoginForm({
  className,
  isRegister = false,
  ...props
}: React.ComponentProps<"div"> & { isRegister?: boolean }) {
  const [formState, setFormState] = useState<FormState>({ username: "", password: "", errors: null });
  const navigate = useNavigate();
  const { login } = useUser();

  const mutation = useMutation({
    ...loginMutation(!!isRegister),
    onSuccess: (data: any) => {
      isRegister || login(data.token);
      navigate(isRegister ? '/login' : '/me');
    },
    onError: (error: Error) => {
      setFormState((prevState) => ({
        ...prevState,
        errors: error.message,
      }));
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState((prevState) => ({ ...prevState, errors: null }));
    mutation.mutate({ username: formState.username, displayName: formState.displayName!, password: formState.password });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>{isRegister ? "Register a new account" : "Login to your account"}</CardTitle>
          <CardDescription>
            {isRegister ? "Enter your details below to register a new account" : "Enter your username and password below to login to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="John Doe"
                  minLength={3}
                  maxLength={20}
                  required
                  value={formState.username}
                  onChange={handleChange}
                />
              </Field>
              {isRegister && (
                <Field>
                  <FieldLabel htmlFor="displayName">Display Name</FieldLabel>
                  <Input
                    id="displayName"
                    name="displayName"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={formState.displayName}
                    onChange={handleChange}
                  />
                </Field>
              )}
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  minLength={8}
                  required
                  value={formState.password}
                  onChange={handleChange}
                />
              </Field>
              {formState.errors && (
                <Field className="-my-3">
                  <p className="text-red-500 text-sm">{formState.errors}</p>
                </Field>
              )}
              <Field>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending
                    ? (isRegister ? "Registering..." : "Logging in...")
                    : (isRegister ? "Register" : "Login")
                  }
                </Button>
              </Field>
            </FieldGroup>
          </form>
          {!isRegister ? (
            <div className="mt-4 text-center text-sm">
              Don't have an account?{" "}
              <a href="/register" className="underline underline-offset-4">
                Register here
              </a>
            </div>
          ) : (
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <a href="/login" className="underline underline-offset-4">
                Back to login
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
