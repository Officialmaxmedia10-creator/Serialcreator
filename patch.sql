-- STORY HUB SECURITY PATCH
-- Run this in Supabase SQL Editor AFTER the original Story Hub setup.
-- It prevents normal authors from changing their own story status.

create or replace function public.enforce_story_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.status := old.status;
    new.author_id := old.author_id;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_story_status on public.stories;

create trigger protect_story_status
before update on public.stories
for each row
execute procedure public.enforce_story_status();
