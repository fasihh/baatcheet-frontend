"use server";

import { FormState, userSchema, UserSchema } from "@/lib/definitions";
import { createSession, deleteSession } from "../session";
import { redirect } from 'next/navigation'
import z from "zod";

export async function login(_state: FormState<UserSchema>, formData: FormData): Promise<FormState<UserSchema> | undefined> {
  const validatedFields = userSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
  });

  const formValues = Object.fromEntries(formData.entries()) as UserSchema;
 
  if (!validatedFields.success) {
    return {
      errors: z.flattenError(validatedFields.error).fieldErrors,
      values: formValues
    };
  }

  const res = await fetch(`${process.env.API_URL}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formValues),
  });

  if (!res.ok) {
    return {
      values: formValues,
      errors: { _form: ["Login failed."] }
    };
  }

  const resData = await res.json();

  await createSession(resData.token);
  redirect('/');
}

export async function register(_state: FormState<UserSchema>, formData: FormData): Promise<FormState<UserSchema> | undefined> {
  const validatedFields = userSchema
    .refine(
      data => !!data.name && data.name.length >= 2,
      {
        error: 'Name must be at least 2 characters long.',
        path: ['name']
      }
    )
    .safeParse({
      name: formData.get('name'),
      username: formData.get('username'),
      password: formData.get('password'),
    });

  const formValues = Object.fromEntries(formData.entries()) as UserSchema;

  if (!validatedFields.success) {
    return {
      errors: z.flattenError(validatedFields.error).fieldErrors as Partial<Record<keyof UserSchema, string[]>>,
      values: formValues
    };
  }

  const res = await fetch(`${process.env.API_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formValues),
  });

  if (!res.ok) {
    return {
      errors: { _form: ["Registration failed."] },
      values: formValues,
    };
  }

  const resData = await res.json();

  await createSession(resData.token);
  redirect('/');
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}
