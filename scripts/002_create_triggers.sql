-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(new.raw_user_meta_data ->> 'last_name', ''),
    COALESCE(new.raw_user_meta_data ->> 'role', 'borrower')
  ) ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp on profile changes
CREATE OR REPLACE FUNCTION public.update_profile_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_profile_timestamp ON public.profiles;
CREATE TRIGGER update_profile_timestamp
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_timestamp();

-- Update timestamp on loan changes
CREATE OR REPLACE FUNCTION public.update_loan_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_loan_timestamp ON public.loans;
CREATE TRIGGER update_loan_timestamp
  BEFORE UPDATE ON public.loans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_loan_timestamp();
