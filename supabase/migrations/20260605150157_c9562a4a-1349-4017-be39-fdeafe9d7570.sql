
-- Projects
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Uploaded',
  page_count INTEGER NOT NULL DEFAULT 0,
  file_path TEXT,
  file_size_bytes BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- OCR/text-per-page
CREATE TABLE public.ocr_text (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  page INTEGER NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ocr_text_project_idx ON public.ocr_text(project_id, page);
GRANT ALL ON public.ocr_text TO service_role;
ALTER TABLE public.ocr_text ENABLE ROW LEVEL SECURITY;

-- Equipment
CREATE TABLE public.equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Equipment',
  line TEXT NOT NULL DEFAULT '',
  size TEXT NOT NULL DEFAULT '',
  page INTEGER NOT NULL DEFAULT 1,
  confidence NUMERIC NOT NULL DEFAULT 0.8,
  status TEXT NOT NULL DEFAULT 'operational',
  suction TEXT,
  discharge TEXT,
  instruments TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX equipment_project_idx ON public.equipment(project_id);
CREATE INDEX equipment_tag_idx ON public.equipment(project_id, tag);
GRANT ALL ON public.equipment TO service_role;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

-- Valves
CREATE TABLE public.valves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Valve',
  line TEXT NOT NULL DEFAULT '',
  size TEXT NOT NULL DEFAULT '',
  page INTEGER NOT NULL DEFAULT 1,
  confidence NUMERIC NOT NULL DEFAULT 0.8,
  status TEXT NOT NULL DEFAULT 'operational',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX valves_project_idx ON public.valves(project_id);
GRANT ALL ON public.valves TO service_role;
ALTER TABLE public.valves ENABLE ROW LEVEL SECURITY;

-- Instruments
CREATE TABLE public.instruments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Instrument',
  line TEXT NOT NULL DEFAULT '',
  size TEXT NOT NULL DEFAULT '—',
  page INTEGER NOT NULL DEFAULT 1,
  confidence NUMERIC NOT NULL DEFAULT 0.8,
  status TEXT NOT NULL DEFAULT 'operational',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX instruments_project_idx ON public.instruments(project_id);
GRANT ALL ON public.instruments TO service_role;
ALTER TABLE public.instruments ENABLE ROW LEVEL SECURITY;

-- Pipelines
CREATE TABLE public.pipelines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  size TEXT NOT NULL DEFAULT '',
  fluid TEXT NOT NULL DEFAULT 'Process Fluid',
  from_tag TEXT,
  to_tag TEXT,
  page INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'operational',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX pipelines_project_idx ON public.pipelines(project_id);
GRANT ALL ON public.pipelines TO service_role;
ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;

-- Issues
CREATE TABLE public.issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  severity TEXT NOT NULL DEFAULT 'medium',
  tag TEXT NOT NULL DEFAULT '',
  explanation TEXT NOT NULL DEFAULT '',
  action TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX issues_project_idx ON public.issues(project_id);
GRANT ALL ON public.issues TO service_role;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- HAZOP items
CREATE TABLE public.hazop_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  deviation TEXT NOT NULL,
  cause TEXT NOT NULL DEFAULT '',
  consequence TEXT NOT NULL DEFAULT '',
  safeguard TEXT NOT NULL DEFAULT '',
  recommendation TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX hazop_project_idx ON public.hazop_items(project_id, sort_order);
GRANT ALL ON public.hazop_items TO service_role;
ALTER TABLE public.hazop_items ENABLE ROW LEVEL SECURITY;

-- Exports
CREATE TABLE public.exports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'PDF',
  size TEXT NOT NULL DEFAULT '0 MB',
  status TEXT NOT NULL DEFAULT 'complete',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX exports_project_idx ON public.exports(project_id);
GRANT ALL ON public.exports TO service_role;
ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;

-- Color rules (global, not per project)
CREATE TABLE public.color_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  min NUMERIC NOT NULL DEFAULT 0,
  max NUMERIC NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.color_rules TO service_role;
ALTER TABLE public.color_rules ENABLE ROW LEVEL SECURITY;

-- Seed default color rules
INSERT INTO public.color_rules (label, min, max, color, sort_order) VALUES
  ('≤ 2"',     0,  2,  '#ef4444', 1),
  ('2" – 4"',  2,  4,  '#3b82f6', 2),
  ('4" – 8"',  4,  8,  '#22c55e', 3),
  ('8" – 20"', 8,  20, '#a855f7', 4),
  ('> 20"',    20, 999,'#f59e0b', 5);

-- updated_at trigger for projects
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER projects_touch BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
