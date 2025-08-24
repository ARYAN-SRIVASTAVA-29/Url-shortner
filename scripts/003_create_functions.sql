-- Utility functions for URL shortener

-- Function to generate short codes
CREATE OR REPLACE FUNCTION generate_short_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (
    NEW.id,
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to get URL analytics
CREATE OR REPLACE FUNCTION get_url_analytics(url_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_clicks', COUNT(*),
    'unique_ips', COUNT(DISTINCT ip_address),
    'clicks_today', COUNT(*) FILTER (WHERE clicked_at >= CURRENT_DATE),
    'clicks_this_week', COUNT(*) FILTER (WHERE clicked_at >= CURRENT_DATE - INTERVAL '7 days'),
    'top_countries', (
      SELECT json_agg(json_build_object('country', country, 'count', count))
      FROM (
        SELECT country, COUNT(*) as count
        FROM public.clicks
        WHERE url_id = url_uuid AND country IS NOT NULL
        GROUP BY country
        ORDER BY count DESC
        LIMIT 5
      ) t
    )
  )
  INTO result
  FROM public.clicks
  WHERE url_id = url_uuid;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
