-- Enable pgvector
create extension if not exists vector;

-- Users table (simple password auth)
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  created_at timestamptz default now()
);

-- Documents table
create table documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  filename text not null,
  file_type text not null default 'txt' check (file_type in ('pdf', 'txt', 'md', 'markdown')),
  status text default 'processing' check (status in ('processing', 'ready', 'error')),
  error_message text,
  created_at timestamptz default now()
);

-- Document chunks with embeddings
create table chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  content text not null,
  chunk_index int not null,
  embedding vector(768),
  created_at timestamptz default now()
);

-- Vector similarity search function
create or replace function match_chunks(
  query_embedding vector(768),
  match_count int default 5,
  filter_user_id uuid default null
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  chunk_index int,
  similarity float
)
language plpgsql as $$
begin
  return query
  select
    c.id, c.document_id, c.content, c.chunk_index,
    1 - (c.embedding <=> query_embedding) as similarity
  from chunks c
  join documents d on d.id = c.document_id
  where (filter_user_id is null or d.user_id = filter_user_id)
  order by c.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Chat conversations
create table conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  title text default 'New Chat',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Chat messages
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  citations jsonb default '[]',
  created_at timestamptz default now()
);

-- Indexes
create index on chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index on documents (user_id);
create index on conversations (user_id);
create index on messages (conversation_id);
create index on messages (created_at);
