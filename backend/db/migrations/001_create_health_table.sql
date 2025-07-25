-- Create health table for system monitoring
CREATE TABLE IF NOT EXISTS public.health (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    status text
);

-- Add initial health check record
INSERT INTO public.health (status) 
VALUES ('OK')
ON CONFLICT DO NOTHING;

-- Add index for timestamp queries
CREATE INDEX IF NOT EXISTS idx_health_created_at ON public.health(created_at);

-- Add documentation
COMMENT ON TABLE public.health IS 'System health monitoring table';
COMMENT ON COLUMN public.health.id IS 'Unique identifier for health records';
COMMENT ON COLUMN public.health.created_at IS 'Timestamp when the health record was created';
COMMENT ON COLUMN public.health.status IS 'Health status message'; 