/*
  # Add Missing Indexes for Foreign Keys
  
  1. Performance Optimization
    - Add indexes for all unindexed foreign keys to improve query performance
    - Indexes help with JOIN operations and foreign key constraint checks
  
  2. New Indexes
    - `idx_chat_messages_receiver_id` - Index on chat_messages.receiver_id
    - `idx_chat_messages_sender_id` - Index on chat_messages.sender_id
    - `idx_memories_partner_id` - Index on memories.partner_id
    - `idx_memories_user_id` - Index on memories.user_id
    - `idx_profiles_partner_id` - Index on profiles.partner_id
    - `idx_prompt_responses_user_id` - Index on prompt_responses.user_id
*/

-- Chat messages indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver_id ON chat_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);

-- Memories indexes
CREATE INDEX IF NOT EXISTS idx_memories_partner_id ON memories(partner_id);
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_partner_id ON profiles(partner_id);

-- Prompt responses indexes
CREATE INDEX IF NOT EXISTS idx_prompt_responses_user_id ON prompt_responses(user_id);