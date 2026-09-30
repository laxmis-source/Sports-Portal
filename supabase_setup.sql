-- ============================================================
-- UNI-SPORTS: Complete Supabase Schema & Seed Script
-- Instructions: Copy ALL lines below and Run in Supabase SQL Editor
-- ============================================================

-- 1. PROFILES (stores user roles: 'admin' or 'student')
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read profiles" ON profiles;
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Insert own profile" ON profiles;
CREATE POLICY "Insert own profile" ON profiles FOR INSERT WITH CHECK (true);

-- Ensure correct permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.profiles TO postgres, anon, authenticated, service_role;

-- Auto-create profile trigger on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 'admin'
      ELSE 'student'
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Prevent auth abortion even if profile edge case occurs
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. SPORTS
CREATE TABLE IF NOT EXISTS sports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#c9a227',
  description TEXT,
  team_info TEXT,
  schedule TEXT,
  how_to_join TEXT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read sports" ON sports;
CREATE POLICY "Public read sports" ON sports FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage sports" ON sports;
CREATE POLICY "Admin manage sports" ON sports FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 3. SPORT ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS sport_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sport_id UUID REFERENCES sports(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE sport_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read sport_achievements" ON sport_achievements;
CREATE POLICY "Public read sport_achievements" ON sport_achievements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage sport_achievements" ON sport_achievements;
CREATE POLICY "Admin manage sport_achievements" ON sport_achievements FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. EVENTS
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Tournament',
  sport TEXT,
  event_date DATE,
  event_time TEXT,
  venue TEXT,
  description TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'upcoming', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read events" ON events;
CREATE POLICY "Public read events" ON events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage events" ON events;
CREATE POLICY "Admin manage events" ON events FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5. REGISTRATIONS
CREATE TABLE IF NOT EXISTS registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  usn TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  course TEXT NOT NULL,
  year TEXT NOT NULL,
  sport TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'trials')),
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crucial: Add missing columns if registrations table was created earlier without them
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert registration" ON registrations;
CREATE POLICY "Anyone can insert registration" ON registrations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users see own registrations" ON registrations;
CREATE POLICY "Users see own registrations" ON registrations FOR SELECT USING (
  (user_id IS NOT NULL AND auth.uid() = user_id) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admin update registrations" ON registrations;
CREATE POLICY "Admin update registrations" ON registrations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admin delete registrations" ON registrations;
CREATE POLICY "Admin delete registrations" ON registrations FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);


-- 6. ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  sport TEXT,
  year TEXT,
  level TEXT DEFAULT 'gold' CHECK (level IN ('gold', 'silver', 'bronze')),
  type TEXT DEFAULT 'championship' CHECK (type IN ('championship', 'student', 'milestone')),
  student_name TEXT,
  event_name TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read achievements" ON achievements;
CREATE POLICY "Public read achievements" ON achievements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage achievements" ON achievements;
CREATE POLICY "Admin manage achievements" ON achievements FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 7. GALLERY
CREATE TABLE IF NOT EXISTS gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Sports Day',
  sport TEXT DEFAULT 'General',
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read gallery" ON gallery;
CREATE POLICY "Public read gallery" ON gallery FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage gallery" ON gallery;
CREATE POLICY "Admin manage gallery" ON gallery FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- Storage bucket for gallery uploads
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public gallery read" ON storage.objects;
CREATE POLICY "Public gallery read" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Admin gallery upload" ON storage.objects;
CREATE POLICY "Admin gallery upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'gallery' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admin gallery delete" ON storage.objects;
CREATE POLICY "Admin gallery delete" ON storage.objects FOR DELETE USING (
  bucket_id = 'gallery' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- SEED DATA (Inserts only if empty to avoid duplicates)
-- ============================================================

INSERT INTO sports (name, color, description, team_info, schedule, how_to_join, order_index) VALUES
('Cricket', '#c9a227', 'Cricket is one of the most popular sports at Chanakya University. Our team competes in inter-college and university-level tournaments across Karnataka.', 'CU Cricket XI – 15 players, coached by Mr. Rajan Kumar.', 'Practice: Mon, Wed, Fri – 5AM to 7AM at CU Cricket Ground', 'Attend trials every semester. Register online and appear for selection rounds.', 1),
('Football', '#1a6b3f', 'CU Football team is renowned for its energetic gameplay. Participate in intra-college leagues and represent the university at state-level competitions.', 'CU United FC – 22 players, coached by Mr. Suresh Nair.', 'Practice: Tue, Thu, Sat – 6AM to 8AM at CU Football Ground', 'Open trials held at the start of each academic year. All courses eligible.', 2),
('Basketball', '#c95b27', 'CU Basketball offers both men''s and women''s teams focusing on teamwork, strategy, and high-energy competitive play.', 'CU Hoops (Men & Women) – 24 players total, coached by Ms. Priya Shetty.', 'Practice: Daily 6PM–8PM at CU Sports Complex Court', 'Register online, attend walk-in trials on the first weekend of each semester.', 3),
('Volleyball', '#27a2c9', 'Volleyball is a team sport where coordination and endurance are key. CU fields both indoor and beach volleyball teams.', 'CU Spikes – 18 players, coached by Mr. Anil Rao.', 'Practice: Mon, Wed, Fri – 4PM–6PM at CU Volleyball Court', 'Open to all students. Trials held in August and January.', 4),
('Badminton', '#8b27c9', 'CU Badminton caters to singles, doubles, and mixed doubles. Regular intra-college and inter-university tournaments.', 'CU Shuttlers – 12 players, coached by Ms. Divya Menon.', 'Practice: Tue, Thu – 5PM–7PM at CU Indoor Badminton Hall', 'Trials conducted at start of semester. Racket provided to selected players.', 5),
('Athletics', '#c92747', 'CU Athletics covers track events (100m, 200m, 400m, relays) and field events (long jump, high jump, shot put, discus).', 'CU Track & Field – 30+ athletes, coached by Mr. Vijay Thakur.', 'Training: Daily 5AM–7AM at CU Athletic Track', 'Performance-based selection. Participate in qualifying rounds every August.', 6)
ON CONFLICT (name) DO NOTHING;

-- Seed sport achievements
INSERT INTO sport_achievements (sport_id, title)
SELECT id, unnest(ARRAY['South Zone Champions 2025', 'State Runner-up 2024', 'Best Batting Average 2023'])
FROM sports WHERE name = 'Cricket'
AND NOT EXISTS (SELECT 1 FROM sport_achievements WHERE sport_id = sports.id);

INSERT INTO sport_achievements (sport_id, title)
SELECT id, unnest(ARRAY['Karnataka Inter-University Semifinal 2024', 'Intra-College Champions 2025'])
FROM sports WHERE name = 'Football'
AND NOT EXISTS (SELECT 1 FROM sport_achievements WHERE sport_id = sports.id);

INSERT INTO sport_achievements (sport_id, title)
SELECT id, unnest(ARRAY['Inter-University Champions 2024', 'Women''s State Bronze 2025'])
FROM sports WHERE name = 'Basketball'
AND NOT EXISTS (SELECT 1 FROM sport_achievements WHERE sport_id = sports.id);

INSERT INTO sport_achievements (sport_id, title)
SELECT id, unnest(ARRAY['State League Runner-up 2024', 'CU Sports Day Champions 2025'])
FROM sports WHERE name = 'Volleyball'
AND NOT EXISTS (SELECT 1 FROM sport_achievements WHERE sport_id = sports.id);

INSERT INTO sport_achievements (sport_id, title)
SELECT id, unnest(ARRAY['Karnataka State Gold – Singles 2025', 'Mixed Doubles State Silver 2024'])
FROM sports WHERE name = 'Badminton'
AND NOT EXISTS (SELECT 1 FROM sport_achievements WHERE sport_id = sports.id);

INSERT INTO sport_achievements (sport_id, title)
SELECT id, unnest(ARRAY['Karnataka State Gold – 400m 2025', '4×100 Relay Silver 2024', 'Best Sports Department Award 2025'])
FROM sports WHERE name = 'Athletics'
AND NOT EXISTS (SELECT 1 FROM sport_achievements WHERE sport_id = sports.id);

-- Seed events
INSERT INTO events (title, category, sport, event_date, event_time, venue, description, status)
SELECT * FROM (VALUES
  ('Inter-College Cricket Tournament', 'Tournament', 'Cricket', '2026-10-15'::DATE, '8:00 AM', 'CU Cricket Ground', 'Annual inter-college cricket championship. Teams from 10+ colleges participating.', 'open'),
  ('CU Basketball Championship', 'Championship', 'Basketball', '2026-10-22'::DATE, '9:00 AM', 'CU Sports Complex', 'Men''s & Women''s basketball championship for university teams.', 'open'),
  ('Athletics Meet 2026', 'Meet', 'Athletics', '2026-11-05'::DATE, '6:00 AM', 'CU Track & Field', 'Annual athletics meet covering track and field events for all students.', 'open'),
  ('Football Team Trials', 'Trials', 'Football', '2026-10-10'::DATE, '7:00 AM', 'CU Football Ground', 'Selection trials for the university football team 2026-27.', 'open'),
  ('Badminton Inter-Department Cup', 'Tournament', 'Badminton', '2026-11-20'::DATE, '10:00 AM', 'CU Indoor Hall', 'Department-level badminton tournament open to all students.', 'upcoming'),
  ('Volleyball State Qualifier', 'Championship', 'Volleyball', '2026-12-03'::DATE, '8:30 AM', 'CU Volleyball Court', 'Qualifier round for the state-level volleyball championship.', 'upcoming')
) AS v(title, category, sport, event_date, event_time, venue, description, status)
WHERE NOT EXISTS (SELECT 1 FROM events LIMIT 1);

-- Seed achievements
INSERT INTO achievements (title, sport, year, level, type, student_name, event_name)
SELECT * FROM (VALUES
  ('South Zone Inter-University Champions', 'Cricket', '2025', 'gold', 'championship', NULL, 'South Zone Tournament'),
  ('Karnataka State Athletics Gold – 400m', 'Athletics', '2025', 'gold', 'championship', NULL, 'State Meet 2025'),
  ('Inter-University Basketball Champions', 'Basketball', '2024', 'gold', 'championship', NULL, 'Inter-University Games'),
  ('Football State Semi-Finals', 'Football', '2024', 'silver', 'championship', NULL, 'Karnataka State Cup'),
  ('Badminton Mixed Doubles Silver', 'Badminton', '2024', 'silver', 'championship', NULL, 'State Badminton Championship'),
  ('Volleyball State League Runner-up', 'Volleyball', '2023', 'silver', 'championship', NULL, 'State Volleyball League'),
  ('Best Batsman – South Zone 2025', 'Cricket', '2025', 'gold', 'student', 'Arjun Rao', 'South Zone 2025'),
  ('State Gold – 100m Sprint', 'Athletics', '2025', 'gold', 'student', 'Priya Sharma', 'State Athletics Meet'),
  ('Most Valuable Player – Inter-University', 'Basketball', '2024', 'gold', 'student', 'Kiran Mehta', 'Inter-University Games'),
  ('State Singles Champion', 'Badminton', '2025', 'gold', 'student', 'Divya Nair', 'State Badminton'),
  ('Top Scorer – Zonal Cup', 'Football', '2024', 'silver', 'student', 'Rohan Singh', 'Zonal Cup 2024'),
  ('Sports Department awarded Best Department by CU', NULL, '2024', 'gold', 'milestone', NULL, NULL),
  ('New state-of-the-art indoor sports complex inaugurated', NULL, '2023', 'gold', 'milestone', NULL, NULL),
  ('First time CU qualified for National Inter-University Games', NULL, '2022', 'silver', 'milestone', NULL, NULL)
) AS v(title, sport, year, level, type, student_name, event_name)
WHERE NOT EXISTS (SELECT 1 FROM achievements LIMIT 1);

-- Seed gallery
INSERT INTO gallery (title, category, sport, image_url)
SELECT * FROM (VALUES
  ('Annual Sports Day Opening Ceremony', 'Sports Day', 'General', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80'),
  ('Cricket Tournament Finals', 'Tournament', 'Cricket', 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&q=80'),
  ('CU Football Team 2025', 'Team', 'Football', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80'),
  ('Basketball Championship Game', 'Tournament', 'Basketball', 'https://images.unsplash.com/photo-1546519638405-a4e668020bdc?w=600&q=80'),
  ('Track Events – Athletics Meet', 'Sports Day', 'Athletics', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&q=80'),
  ('CU Badminton Squad', 'Team', 'Badminton', 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&q=80'),
  ('Volleyball League Match', 'Tournament', 'Volleyball', 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600&q=80'),
  ('Award Ceremony Highlights', 'Sports Day', 'General', 'https://images.unsplash.com/photo-1567958451986-2de427a4a0be?w=600&q=80'),
  ('CU Cricket Team Group Photo', 'Team', 'Cricket', 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=600&q=80'),
  ('Football Quarter-Finals', 'Tournament', 'Football', 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=600&q=80'),
  ('Long Jump Competition', 'Sports Day', 'Athletics', 'https://images.unsplash.com/photo-1594882645126-14020914d58d?w=600&q=80'),
  ('CU Basketball Team 2025', 'Team', 'Basketball', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&q=80')
) AS v(title, category, sport, image_url)
WHERE NOT EXISTS (SELECT 1 FROM gallery LIMIT 1);
