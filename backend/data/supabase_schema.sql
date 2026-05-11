-- Enable the PostGIS extension if it's not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create the reports table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL DEFAULT 'pothole',
    photo_url TEXT DEFAULT '',
    photo_public_id TEXT DEFAULT '',
    lat NUMERIC NOT NULL,
    lng NUMERIC NOT NULL,
    remarks VARCHAR(500) DEFAULT '',
    status VARCHAR(20) DEFAULT 'pending',
    ward_no INTEGER DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- PostGIS generated column for location
    location geometry(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(lng, lat), 4326)) STORED
);

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Create indexes for frequent query patterns
CREATE INDEX IF NOT EXISTS reports_status_created_at_idx ON public.reports (status, created_at DESC);
CREATE INDEX IF NOT EXISTS reports_ward_no_idx ON public.reports (ward_no);
CREATE INDEX IF NOT EXISTS reports_location_idx ON public.reports USING GIST (location);
