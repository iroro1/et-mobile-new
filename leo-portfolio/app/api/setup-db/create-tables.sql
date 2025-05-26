-- Create a stored procedure to create the certifications table if it doesn't exist
CREATE OR REPLACE FUNCTION create_certifications_table()
RETURNS void AS $$
BEGIN
  -- Check if certifications table exists
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'certifications'
  ) THEN
    -- Create certifications table
    CREATE TABLE certifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      issuer TEXT NOT NULL,
      issueDate TEXT NOT NULL,
      expirationDate TEXT,
      description TEXT,
      imageUrl TEXT,
      url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Create trigger for updating the updated_at timestamp
    CREATE TRIGGER update_certifications_updated_at
    BEFORE UPDATE ON certifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$ LANGUAGE plpgsql;
