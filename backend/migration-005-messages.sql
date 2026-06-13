-- Migration: 005 - Create Chat Messages Table

CREATE TYPE message_sender AS ENUM ('user', 'assistant', 'system');

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender message_sender NOT NULL,
    message TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    risk_flag BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fetching chronological chat history efficiently
CREATE INDEX idx_chat_messages_session_id_created_at ON chat_messages(session_id, created_at ASC);

-- Index for user lookup performance
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);

-- Enable Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Fast direct-check RLS Policies
CREATE POLICY "Users can view messages of their sessions" 
    ON chat_messages FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert messages to their sessions" 
    ON chat_messages FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update messages of their sessions" 
    ON chat_messages FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete messages of their sessions" 
    ON chat_messages FOR DELETE 
    USING (auth.uid() = user_id);
