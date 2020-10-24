create extension if not exists "uuid-ossp";

-- todo: migration script

-- todo: references chef table id not userId
create table if not exists recipe (
    id bigint generated always as identity,
    internalReference uuid unique not null default uuid_generate_v1(),
    title varchar(50) unique not null,
    details jsonb not null default '{}'::jsonb,
    userId varchar(255) not null,
    primary key(id)
);

create index if not exists idx_recipe_user_id on recipe(userId);
create index if not exists idx_recipe_title on recipe(title);
create index if not exists idx_gin_recipe_details on recipe using gin (details jsonb_path_ops);

create table if not exists ingredient (
    id bigint generated always as identity,
    title varchar(30) unique not null,
    userId varchar(255) not null,
    link text,
    primary key(id),
);

create index if not exists idx_ingredient_title on ingredient(title);

create table if not exists chef (
    id bigint generated always as identity,
    details jsonb not null default '{}'::jsonb,
    userId varchar(255) unique not null,
    primary key(id)
);

create index if not exists idx_chef_user_id on chef(userId);
create index if not exists idx_gin_chef_details on chef using gin (details jsonb_path_ops);

create table if not exists admin_options (
    setting varchar(50),
    setting_value varchar(50)
);

create table if not exists recipe_rating (
    recipeId bigint not null references recipe(id),
    rating int not null,
    chefId bigint null references chef(id)
);

create index if not exists idx_recipe_rating_recipe_id on recipe_rating(recipeId);
create index if not exists idx_recipe_rating_chef_id on recipe_rating(chefId);

create table if not exists advert (
    id bigint generated always as identity,
    src text not null
);

create function getIngredients(bigint) returns table (ingredients jsonb) as $$
select jsonb_agg(result) from (
select
    i.title as name,
    ing->>'measure' as measure,
    ing->>'quantity' as quantity,
    i.link
from recipe r,
     lateral jsonb_array_elements(details->'ingredients') ing
inner join ingredient i on ing->>'name' = i.title
where r.id = $1) as result
$$ language sql;
