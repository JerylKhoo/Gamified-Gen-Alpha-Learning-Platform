-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- USER TABLE
-- =====================
CREATE TABLE "USER" (
    USER_ID UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    Name TEXT NOT NULL,
    Points JSONB DEFAULT '{}',
    Profile_Pic TEXT,
    Role TEXT NOT NULL DEFAULT 'User' CHECK (Role IN ('Admin', 'User', 'Collaborator'))
);

-- =====================
-- AUTO-CREATE USER TRIGGER
-- =====================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public."USER" (USER_ID, Name)
    VALUES (NEW.id, split_part(NEW.email, '@', 1));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================
-- POSTS TABLE
-- =====================
CREATE TABLE POSTS (
    POST_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    USER_ID UUID NOT NULL REFERENCES "USER"(USER_ID) ON DELETE CASCADE,
    Picture TEXT,
    Description TEXT,
    Report_Count INT DEFAULT 0,
    Upvote INT DEFAULT 0
);

-- =====================
-- LESSONS TABLE
-- =====================
CREATE TABLE LESSONS (
    LESSON_ID TEXT PRIMARY KEY,
    Category TEXT NOT NULL,
    Name TEXT NOT NULL
);

-- =====================
-- QUESTIONS TABLE
-- =====================
CREATE TABLE QUESTIONS (
    QUESTION_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    LESSON_ID TEXT NOT NULL REFERENCES LESSONS(LESSON_ID) ON DELETE CASCADE,
    Question TEXT NOT NULL,
    Options JSONB NOT NULL,
    Answer TEXT NOT NULL,
    Explanation TEXT
);

-- =====================
-- QUIZ TABLE
-- =====================
CREATE TABLE QUIZ (
    QUIZ_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    LESSON_ID TEXT NOT NULL REFERENCES LESSONS(LESSON_ID) ON DELETE CASCADE,
    Question TEXT NOT NULL,
    Type TEXT NOT NULL,
    Options JSONB,
    Answer TEXT NOT NULL
);

-- =====================
-- PROGRESS TABLE
-- =====================
CREATE TABLE PROGRESS (
    PROGRESS_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    USER_ID UUID NOT NULL REFERENCES "USER"(USER_ID) ON DELETE CASCADE,
    LESSON_ID TEXT NOT NULL REFERENCES LESSONS(LESSON_ID) ON DELETE CASCADE,
    Adaptive_Score JSONB DEFAULT '{}',
    Correct_Questions JSONB DEFAULT '[]',
    Wrong_Questions JSONB DEFAULT '[]',
    UNIQUE (USER_ID, LESSON_ID)
);

-- =====================
-- STORAGE BUCKETS
-- =====================
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('avatars', 'avatars', true),
    ('posts', 'posts', true);

-- =====================
-- STORAGE POLICIES
-- =====================
CREATE POLICY "Avatar upload for own user"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatar update for own user"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatars are publicly viewable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Post image upload for own user"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'posts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Post images are publicly viewable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'posts');

-- =====================
-- ROW LEVEL SECURITY (RLS)
-- =====================
ALTER TABLE "USER" ENABLE ROW LEVEL SECURITY;
ALTER TABLE POSTS ENABLE ROW LEVEL SECURITY;
ALTER TABLE LESSONS ENABLE ROW LEVEL SECURITY;
ALTER TABLE QUESTIONS ENABLE ROW LEVEL SECURITY;
ALTER TABLE QUIZ ENABLE ROW LEVEL SECURITY;
ALTER TABLE PROGRESS ENABLE ROW LEVEL SECURITY;

-- USER policies
CREATE POLICY "Users can view all profiles"
ON "USER" FOR SELECT TO public USING (true);

CREATE POLICY "Users can update own profile"
ON "USER" FOR UPDATE TO authenticated
USING (auth.uid() = USER_ID);

-- POSTS policies
CREATE POLICY "Posts are publicly viewable"
ON POSTS FOR SELECT TO public USING (true);

CREATE POLICY "Users can insert own posts"
ON POSTS FOR INSERT TO authenticated
WITH CHECK (auth.uid() = USER_ID);

CREATE POLICY "Users can update own posts"
ON POSTS FOR UPDATE TO authenticated
USING (auth.uid() = USER_ID);

CREATE POLICY "Users can delete own posts"
ON POSTS FOR DELETE TO authenticated
USING (auth.uid() = USER_ID);

-- LESSONS policies
CREATE POLICY "Lessons are publicly viewable"
ON LESSONS FOR SELECT TO public USING (true);

CREATE POLICY "Only admins can manage lessons"
ON LESSONS FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM "USER"
        WHERE USER_ID = auth.uid() AND Role = 'Admin'
    )
);

-- QUESTIONS policies
CREATE POLICY "Questions are publicly viewable"
ON QUESTIONS FOR SELECT TO public USING (true);

CREATE POLICY "Only admins can manage questions"
ON QUESTIONS FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM "USER"
        WHERE USER_ID = auth.uid() AND Role = 'Admin'
    )
);

-- QUIZ policies
CREATE POLICY "Quiz is publicly viewable"
ON QUIZ FOR SELECT TO public USING (true);

CREATE POLICY "Only admins can manage quiz"
ON QUIZ FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM "USER"
        WHERE USER_ID = auth.uid() AND Role = 'Admin'
    )
);

-- PROGRESS policies
CREATE POLICY "Users can view own progress"
ON PROGRESS FOR SELECT TO authenticated
USING (auth.uid() = USER_ID);

CREATE POLICY "Users can insert own progress"
ON PROGRESS FOR INSERT TO authenticated
WITH CHECK (auth.uid() = USER_ID);

CREATE POLICY "Users can update own progress"
ON PROGRESS FOR UPDATE TO authenticated
USING (auth.uid() = USER_ID);