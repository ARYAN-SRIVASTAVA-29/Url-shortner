-- Row Level Security Policies for URL Shortener

-- Users policies
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- URLs policies
CREATE POLICY "urls_select_own" ON public.urls
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "urls_insert_own" ON public.urls
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "urls_update_own" ON public.urls
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "urls_delete_own" ON public.urls
  FOR DELETE USING (auth.uid() = user_id);

-- Public read access for URL resolution (anonymous users can access short URLs)
CREATE POLICY "urls_public_read" ON public.urls
  FOR SELECT USING (is_active = TRUE);

-- Clicks policies (users can view analytics for their URLs)
CREATE POLICY "clicks_select_own_urls" ON public.clicks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.urls 
      WHERE urls.id = clicks.url_id 
      AND urls.user_id = auth.uid()
    )
  );

CREATE POLICY "clicks_insert_public" ON public.clicks
  FOR INSERT WITH CHECK (TRUE); -- Anyone can create click records
