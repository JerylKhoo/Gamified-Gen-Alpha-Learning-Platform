-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES
    ('profilepic', 'profilepic', true),
    ('badges', 'badges', true),
    ('posts', 'posts', true),
    ('course', 'course', true),
    ('module', 'module', true),
    ('quizmaterial', 'quizmaterial', true)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- TABLES
-- ============================================================

-- USER
CREATE TABLE IF NOT EXISTS public."USER" (
    User_ID     UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    Name        TEXT        NOT NULL,
    Points      INTEGER     NOT NULL DEFAULT 0,
    Profile_Pic TEXT,
    Role        TEXT        NOT NULL DEFAULT 'User' CHECK (Role IN ('Admin', 'User', 'Collaborator'))
);

-- BADGES
CREATE TABLE IF NOT EXISTS public.BADGES (
    Badge_ID    TEXT        PRIMARY KEY,
    Name        TEXT        NOT NULL,
    Description TEXT,
    Icon        TEXT
);

-- USER_BADGES
CREATE TABLE IF NOT EXISTS public.USER_BADGES (
    User_Badge_ID   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    User_ID         UUID        NOT NULL REFERENCES public."USER"(User_ID) ON DELETE CASCADE,
    Badge_ID        TEXT        NOT NULL REFERENCES public.BADGES(Badge_ID) ON DELETE CASCADE,
    Earned_At       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- POSTS
CREATE TABLE IF NOT EXISTS public.POSTS (
    Post_ID         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    User_ID         UUID        NOT NULL REFERENCES public."USER"(User_ID) ON DELETE CASCADE,
    Picture         TEXT,
    Description     TEXT,
    Report_Count    INTEGER     NOT NULL DEFAULT 0,
    Upvote          INTEGER     NOT NULL DEFAULT 0,
    Title           TEXT,
    Category        TEXT
);

-- USER_STREAKS
CREATE TABLE IF NOT EXISTS public.USER_STREAKS (
    Streak_ID           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    User_ID             UUID    NOT NULL REFERENCES public."USER"(User_ID) ON DELETE CASCADE,
    Current_Streak      INTEGER NOT NULL DEFAULT 0,
    Longest_Streak      INTEGER NOT NULL DEFAULT 0,
    Streak_Start        DATE,
    Last_Activity_Date  DATE
);

-- COURSE
CREATE TABLE IF NOT EXISTS public.COURSE (
    Course_ID   TEXT    PRIMARY KEY,
    Description TEXT,
    Image       TEXT
);

-- MODULE
CREATE TABLE IF NOT EXISTS public.MODULE (
    Module_ID   TEXT    PRIMARY KEY,
    Course_ID   TEXT    NOT NULL REFERENCES public.COURSE(Course_ID) ON DELETE CASCADE,
    Content     JSONB
);

-- QUIZ
CREATE TABLE IF NOT EXISTS public.QUIZ (
    Quiz_ID         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    Course_ID       TEXT    NOT NULL REFERENCES public.COURSE(Course_ID) ON DELETE CASCADE,
    Question        TEXT,
    Type            TEXT,
    Options         JSONB,
    Answer          TEXT,
    Explanation     TEXT,
    Score           INTEGER,
    Quiz_Material   TEXT
);

-- QUIZ_PROGRESS
CREATE TABLE IF NOT EXISTS public.QUIZ_PROGRESS (
    Quiz_Progress_ID    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    User_ID             UUID        NOT NULL REFERENCES public."USER"(User_ID) ON DELETE CASCADE,
    Course_ID           TEXT        NOT NULL REFERENCES public.COURSE(Course_ID) ON DELETE CASCADE,
    Adaptive_Score      JSONB       NOT NULL DEFAULT '{}',
    Correct_Questions   JSONB       NOT NULL DEFAULT '[]',
    Wrong_Questions     JSONB       NOT NULL DEFAULT '[]',
    Adaptive_History    JSONB       NOT NULL DEFAULT '[]',
    Last_Update         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- COURSE_PROGRESS
CREATE TABLE IF NOT EXISTS public.COURSE_PROGRESS (
    Course_Progress_ID  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    User_ID             UUID    NOT NULL REFERENCES public."USER"(User_ID) ON DELETE CASCADE,
    Course_ID           TEXT    NOT NULL REFERENCES public.COURSE(Course_ID) ON DELETE CASCADE,
    Module_ID           TEXT    NOT NULL REFERENCES public.MODULE(Module_ID) ON DELETE CASCADE
);

-- CHAT_BOT
CREATE TABLE IF NOT EXISTS public.CHAT_BOT (
    Chat_ID         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    User_ID         UUID    NOT NULL REFERENCES public."USER"(User_ID) ON DELETE CASCADE,
    Score           INTEGER NOT NULL DEFAULT 0,
    Chat_History    JSONB   NOT NULL DEFAULT '{}'
);


-- ============================================================
-- TRIGGER: Auto-create USER row on auth.users insert
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_avatar_name TEXT;
    v_avatar_url  TEXT;
BEGIN
    SELECT name INTO v_avatar_name
    FROM storage.objects
    WHERE bucket_id = 'profilepic'
    ORDER BY random()
    LIMIT 1;

    IF v_avatar_name IS NOT NULL THEN
        v_avatar_url := 'https://thuyecuhlufqvabzeqlg.supabase.co/storage/v1/object/public/profilepic/' || v_avatar_name;
    END IF;

    INSERT INTO public."USER" (User_ID, Name, Profile_Pic)
    VALUES (
        NEW.id,
        split_part(NEW.email, '@', 1),
        v_avatar_url
    );

    RETURN NEW;
END;
$$;


-- ============================================================
-- TRIGGER: Update streak on Quiz_Progress insert / update
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_quiz_progress_streak()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_today         DATE := CURRENT_DATE;
    v_streak        RECORD;
    v_diff          INTEGER;
BEGIN
    SELECT * INTO v_streak
    FROM public.USER_STREAKS
    WHERE User_ID = NEW.User_ID;

    IF NOT FOUND THEN
        INSERT INTO public.USER_STREAKS
            (User_ID, Current_Streak, Longest_Streak, Streak_Start, Last_Activity_Date)
        VALUES
            (NEW.User_ID, 1, 1, v_today, v_today);
        RETURN NEW;
    END IF;

    IF v_streak.Last_Activity_Date IS NULL THEN
        UPDATE public.USER_STREAKS SET
            Current_Streak      = 1,
            Longest_Streak      = GREATEST(v_streak.Longest_Streak, 1),
            Streak_Start        = v_today,
            Last_Activity_Date  = v_today
        WHERE User_ID = NEW.User_ID;
        RETURN NEW;
    END IF;

    -- Same day — no change
    IF v_today = v_streak.Last_Activity_Date THEN
        RETURN NEW;
    END IF;

    v_diff := v_today - v_streak.Last_Activity_Date;

    IF v_diff = 1 THEN
        -- Consecutive day: extend streak
        UPDATE public.USER_STREAKS SET
            Current_Streak      = v_streak.Current_Streak + 1,
            Longest_Streak      = GREATEST(v_streak.Longest_Streak, v_streak.Current_Streak + 1),
            Last_Activity_Date  = v_today
        WHERE User_ID = NEW.User_ID;

    ELSE
        -- Gap > 1 day: reset streak
        UPDATE public.USER_STREAKS SET
            Current_Streak      = 1,
            Longest_Streak      = CASE
                                      WHEN v_streak.Current_Streak > v_streak.Longest_Streak
                                      THEN v_streak.Current_Streak
                                      ELSE v_streak.Longest_Streak
                                  END,
            Streak_Start        = v_today,
            Last_Activity_Date  = v_today
        WHERE User_ID = NEW.User_ID;
    END IF;

    RETURN NEW;
END;
$$;


-- ============================================================
-- TRIGGER: Update streak on Course_Progress insert
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_course_progress_streak()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_today         DATE := CURRENT_DATE;
    v_streak        RECORD;
    v_diff          INTEGER;
BEGIN
    SELECT * INTO v_streak
    FROM public.USER_STREAKS
    WHERE User_ID = NEW.User_ID;

    IF NOT FOUND THEN
        INSERT INTO public.USER_STREAKS
            (User_ID, Current_Streak, Longest_Streak, Streak_Start, Last_Activity_Date)
        VALUES
            (NEW.User_ID, 1, 1, v_today, v_today);
        RETURN NEW;
    END IF;

    IF v_streak.Last_Activity_Date IS NULL THEN
        UPDATE public.USER_STREAKS SET
            Current_Streak      = 1,
            Longest_Streak      = GREATEST(v_streak.Longest_Streak, 1),
            Streak_Start        = v_today,
            Last_Activity_Date  = v_today
        WHERE User_ID = NEW.User_ID;
        RETURN NEW;
    END IF;

    IF v_today = v_streak.Last_Activity_Date THEN
        RETURN NEW;
    END IF;

    v_diff := v_today - v_streak.Last_Activity_Date;

    IF v_diff = 1 THEN
        UPDATE public.USER_STREAKS SET
            Current_Streak      = v_streak.Current_Streak + 1,
            Longest_Streak      = GREATEST(v_streak.Longest_Streak, v_streak.Current_Streak + 1),
            Last_Activity_Date  = v_today
        WHERE User_ID = NEW.User_ID;

    ELSE
        UPDATE public.USER_STREAKS SET
            Current_Streak      = 1,
            Longest_Streak      = CASE
                                      WHEN v_streak.Current_Streak > v_streak.Longest_Streak
                                      THEN v_streak.Current_Streak
                                      ELSE v_streak.Longest_Streak
                                  END,
            Streak_Start        = v_today,
            Last_Activity_Date  = v_today
        WHERE User_ID = NEW.User_ID;
    END IF;

    RETURN NEW;
END;
$$;


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public."USER"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.BADGES           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.USER_BADGES      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.POSTS            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.USER_STREAKS     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.COURSE           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.MODULE           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.QUIZ             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.QUIZ_PROGRESS    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.COURSE_PROGRESS  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.CHAT_BOT         ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- HELPER: role lookup (avoids repeated sub-selects in policies)
-- ============================================================
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT Role FROM public."USER" WHERE User_ID = auth.uid();
$$;


-- --------------------------------------------------------
-- POSTS policies
-- --------------------------------------------------------

-- Anyone (including anonymous) can read posts
CREATE POLICY "posts_select_public"
    ON public.POSTS FOR SELECT
    USING (true);

-- Collaborators can insert their own posts
CREATE POLICY "posts_insert_collaborator"
    ON public.POSTS FOR INSERT
    WITH CHECK (
        auth.uid() = User_ID
        AND public.current_user_role() IN ('Collaborator', 'Admin')
    );

-- Collaborators can update their own posts; Admins can update any
CREATE POLICY "posts_update_collaborator_or_admin"
    ON public.POSTS FOR UPDATE
    USING (
        (auth.uid() = User_ID AND public.current_user_role() = 'Collaborator')
        OR public.current_user_role() = 'Admin'
    );

-- Collaborators can delete their own posts; Admins can delete any
CREATE POLICY "posts_delete_collaborator_or_admin"
    ON public.POSTS FOR DELETE
    USING (
        (auth.uid() = User_ID AND public.current_user_role() = 'Collaborator')
        OR public.current_user_role() = 'Admin'
    );


-- --------------------------------------------------------
-- USER policies
-- --------------------------------------------------------

-- Users can read any user row
CREATE POLICY "user_select_all"
    ON public."USER" FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Users can update only their own row; Admins can update any
CREATE POLICY "user_update_own_or_admin"
    ON public."USER" FOR UPDATE
    USING (
        auth.uid() = User_ID
        OR public.current_user_role() = 'Admin'
    );

-- Only admins can delete users
CREATE POLICY "user_delete_admin"
    ON public."USER" FOR DELETE
    USING (public.current_user_role() = 'Admin');


-- --------------------------------------------------------
-- BADGES policies
-- --------------------------------------------------------

CREATE POLICY "badges_select_all"
    ON public.BADGES FOR SELECT
    USING (true);

CREATE POLICY "badges_admin_all"
    ON public.BADGES FOR ALL
    USING (public.current_user_role() = 'Admin');


-- --------------------------------------------------------
-- USER_BADGES policies
-- --------------------------------------------------------

CREATE POLICY "user_badges_select_own"
    ON public.USER_BADGES FOR SELECT
    USING (auth.uid() = User_ID OR public.current_user_role() = 'Admin');

CREATE POLICY "user_badges_admin_all"
    ON public.USER_BADGES FOR ALL
    USING (public.current_user_role() = 'Admin');


-- --------------------------------------------------------
-- USER_STREAKS policies
-- --------------------------------------------------------

CREATE POLICY "streaks_select_own"
    ON public.USER_STREAKS FOR SELECT
    USING (auth.uid() = User_ID OR public.current_user_role() = 'Admin');

CREATE POLICY "streaks_admin_all"
    ON public.USER_STREAKS FOR ALL
    USING (public.current_user_role() = 'Admin');


-- --------------------------------------------------------
-- COURSE policies
-- --------------------------------------------------------

CREATE POLICY "course_select_all"
    ON public.COURSE FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "course_admin_all"
    ON public.COURSE FOR ALL
    USING (public.current_user_role() = 'Admin');


-- --------------------------------------------------------
-- MODULE policies
-- --------------------------------------------------------

CREATE POLICY "module_select_all"
    ON public.MODULE FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "module_admin_all"
    ON public.MODULE FOR ALL
    USING (public.current_user_role() = 'Admin');


-- --------------------------------------------------------
-- QUIZ policies
-- --------------------------------------------------------

CREATE POLICY "quiz_select_all"
    ON public.QUIZ FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "quiz_admin_all"
    ON public.QUIZ FOR ALL
    USING (public.current_user_role() = 'Admin');


-- --------------------------------------------------------
-- QUIZ_PROGRESS policies
-- --------------------------------------------------------

CREATE POLICY "quiz_progress_select_own"
    ON public.QUIZ_PROGRESS FOR SELECT
    USING (auth.uid() = User_ID OR public.current_user_role() = 'Admin');

CREATE POLICY "quiz_progress_insert_own"
    ON public.QUIZ_PROGRESS FOR INSERT
    WITH CHECK (auth.uid() = User_ID);

CREATE POLICY "quiz_progress_update_own"
    ON public.QUIZ_PROGRESS FOR UPDATE
    USING (auth.uid() = User_ID OR public.current_user_role() = 'Admin');

CREATE POLICY "quiz_progress_admin_delete"
    ON public.QUIZ_PROGRESS FOR DELETE
    USING (public.current_user_role() = 'Admin');


-- --------------------------------------------------------
-- COURSE_PROGRESS policies
-- --------------------------------------------------------

CREATE POLICY "course_progress_select_own"
    ON public.COURSE_PROGRESS FOR SELECT
    USING (auth.uid() = User_ID OR public.current_user_role() = 'Admin');

CREATE POLICY "course_progress_insert_own"
    ON public.COURSE_PROGRESS FOR INSERT
    WITH CHECK (auth.uid() = User_ID);

CREATE POLICY "course_progress_admin_all"
    ON public.COURSE_PROGRESS FOR ALL
    USING (public.current_user_role() = 'Admin');


-- --------------------------------------------------------
-- CHAT_BOT policies
-- --------------------------------------------------------

CREATE POLICY "chatbot_select_own"
    ON public.CHAT_BOT FOR SELECT
    USING (auth.uid() = User_ID OR public.current_user_role() = 'Admin');

CREATE POLICY "chatbot_insert_own"
    ON public.CHAT_BOT FOR INSERT
    WITH CHECK (auth.uid() = User_ID);

CREATE POLICY "chatbot_update_own"
    ON public.CHAT_BOT FOR UPDATE
    USING (auth.uid() = User_ID OR public.current_user_role() = 'Admin');

CREATE POLICY "chatbot_admin_delete"
    ON public.CHAT_BOT FOR DELETE
    USING (public.current_user_role() = 'Admin');


-- ============================================================
-- STORAGE POLICIES
-- ============================================================

-- profilepic: public read, admin write
CREATE POLICY "profilepic_public_read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'profilepic');

CREATE POLICY "profilepic_admin_write"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'profilepic' AND public.current_user_role() = 'Admin');

-- badges: public read, admin write
CREATE POLICY "badges_public_read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'badges');

CREATE POLICY "badges_admin_write"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'badges' AND public.current_user_role() = 'Admin');

-- posts: public read, collaborators/admins write
CREATE POLICY "posts_public_read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'posts');

CREATE POLICY "posts_collaborator_write"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'posts'
        AND public.current_user_role() IN ('Collaborator', 'Admin')
    );

-- course: authenticated read, admin write
CREATE POLICY "course_auth_read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'course' AND auth.uid() IS NOT NULL);

CREATE POLICY "course_admin_write"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'course' AND public.current_user_role() = 'Admin');

-- module: authenticated read, admin write
CREATE POLICY "module_auth_read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'module' AND auth.uid() IS NOT NULL);

CREATE POLICY "module_admin_write"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'module' AND public.current_user_role() = 'Admin');

-- quizmaterial: authenticated read, admin write
CREATE POLICY "quizmaterial_auth_read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'quizmaterial' AND auth.uid() IS NOT NULL);

CREATE POLICY "quizmaterial_admin_write"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'quizmaterial' AND public.current_user_role() = 'Admin');
