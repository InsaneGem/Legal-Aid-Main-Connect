-- Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Allow admins to delete lawyer profiles
CREATE POLICY "Admins can delete lawyer profiles"
ON public.lawyer_profiles
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Allow admins to delete user roles
CREATE POLICY "Admins can delete user roles"
ON public.user_roles
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Allow admins to delete wallets
CREATE POLICY "Admins can delete wallets"
ON public.wallets
FOR DELETE
USING (has_role(auth.uid(), 'admin'));