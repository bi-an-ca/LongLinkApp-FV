/*
  # Add message status tracking
  
  Add status column to track message delivery state:
  - 'sending' - Message is being sent
  - 'sent' - Message has been sent (default)
  - 'delivered' - Message has been delivered to recipient
  - 'read' - Message has been read by recipient
*/

-- Add status column to chat_messages
ALTER TABLE chat_messages 
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'sent' CHECK (status IN ('sending', 'sent', 'delivered', 'read'));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_status ON chat_messages(status);

-- Update existing messages to have 'sent' status
UPDATE chat_messages SET status = 'sent' WHERE status IS NULL;

