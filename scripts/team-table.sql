-- Team Members
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'tech' CHECK (role IN ('admin','dispatcher','lead-tech','senior-tech','tech','accountant')),
  status TEXT DEFAULT 'offline' CHECK (status IN ('online','busy','away','offline')),
  specialties TEXT[] DEFAULT '{}',
  rating NUMERIC DEFAULT 4.5,
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_team_company ON public.team_members(company_id);
ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;
