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
  password: string;
  errors: string | null;
};

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [formState, setFormState] = useState<FormState>({ username: "", password: "", errors: null });
  const navigate = useNavigate();
  const { login } = useUser();

  const mutation = useMutation({
    ...loginMutation,
    onSuccess: (data: any) => {
      console.log(data);
      login(data.token);
      navigate('/chats');
    },
    onError: (error: Error) => {
      console.error("Login failed:", error.message);
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
    mutation.mutate({ username: formState.username, password: formState.password });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
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
                  required
                  value={formState.username}
                  onChange={handleChange}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
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
                  {mutation.isPending ? "Logging in..." : "Login"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
