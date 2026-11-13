
import { supabase } from '@/lib/supabase';

export interface TutorConversationRow {
  id: string;
  student_id: string;
  subject: string;
  title: string | null;
  last_lesson_id: string | null;
  last_lesson_title: string | null;
  last_topic: string | null;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export interface TutorMessageRow {
  id: string;
  conversation_id: string;
  role: 'student' | 'assistant';
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface TutorConversationResult {
  conversation: TutorConversationRow;
  isNew: boolean;
}

export interface TutorConversationProgress {
  last_lesson_id?: string | null;
  last_lesson_title?: string | null;
  last_topic?: string | null;
  title?: string | null;
}

function validateRequiredValue(
  value: string,
  fieldName: string
): void {
  if (!value || !value.trim()) {
    throw new Error(`${fieldName} is required`);
  }
}

/**
 * Gets the existing conversation for a student and subject.
 * Creates a new conversation when none exists.
 */
export async function getOrCreateTutorConversation(
  studentId: string,
  subject: string
): Promise<TutorConversationResult> {
  validateRequiredValue(studentId, 'Student ID');
  validateRequiredValue(subject, 'Subject');

  const { data: existingConversation, error: fetchError } =
    await supabase
      .from('tutor_conversations')
      .select('*')
      .eq('student_id', studentId)
      .eq('subject', subject)
      .maybeSingle();

  if (fetchError) {
    console.error(
      'getOrCreateTutorConversation fetch error:',
      fetchError.message
    );

    throw new Error('Could not load the tutor conversation');
  }

  if (existingConversation) {
    return {
      conversation: existingConversation as TutorConversationRow,
      isNew: false,
    };
  }

  const { data: newConversation, error: insertError } =
    await supabase
      .from('tutor_conversations')
      .insert({
        student_id: studentId,
        subject,
      })
      .select('*')
      .single();

  if (!insertError && newConversation) {
    return {
      conversation: newConversation as TutorConversationRow,
      isNew: true,
    };
  }

  // Another request may have created the conversation
  // between the initial lookup and the insert.
  if (insertError?.code === '23505') {
    const { data: existingAfterConflict, error: retryError } =
      await supabase
        .from('tutor_conversations')
        .select('*')
        .eq('student_id', studentId)
        .eq('subject', subject)
        .single();

    if (!retryError && existingAfterConflict) {
      return {
        conversation: existingAfterConflict as TutorConversationRow,
        isNew: false,
      };
    }
  }

  console.error(
    'getOrCreateTutorConversation insert error:',
    insertError?.message
  );

  throw new Error('Could not create the tutor conversation');
}

/**
 * Loads all messages belonging to one conversation.
 */
export async function fetchTutorMessages(
  conversationId: string
): Promise<TutorMessageRow[]> {
  validateRequiredValue(conversationId, 'Conversation ID');

  const { data, error } = await supabase
    .from('tutor_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error(
      'fetchTutorMessages error:',
      error.message
    );

    throw new Error('Could not load conversation messages');
  }

  return (data || []) as TutorMessageRow[];
}

/**
 * Saves a student or assistant message.
 */
export async function saveTutorMessage(input: {
  conversationId: string;
  role: 'student' | 'assistant';
  content: string;
  metadata?: Record<string, unknown>;
}): Promise<TutorMessageRow> {
  validateRequiredValue(
    input.conversationId,
    'Conversation ID'
  );

  validateRequiredValue(input.content, 'Message content');

  const { data, error } = await supabase
    .from('tutor_messages')
    .insert({
      conversation_id: input.conversationId,
      role: input.role,
      content: input.content,
      metadata: input.metadata || {},
    })
    .select('*')
    .single();

  if (error || !data) {
    console.error(
      'saveTutorMessage error:',
      error?.message
    );

    throw new Error('Could not save the conversation message');
  }

  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from('tutor_conversations')
    .update({
      last_message_at: now,
      updated_at: now,
    })
    .eq('id', input.conversationId);

  if (updateError) {
    console.error(
      'saveTutorMessage conversation update error:',
      updateError.message
    );
  }

  return data as TutorMessageRow;
}

/**
 * Saves the last lesson and topic reached by the student.
 */
export async function updateTutorConversationProgress(
  conversationId: string,
  progress: TutorConversationProgress
): Promise<boolean> {
  validateRequiredValue(conversationId, 'Conversation ID');

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (progress.last_lesson_id !== undefined) {
    updates.last_lesson_id = progress.last_lesson_id;
  }

  if (progress.last_lesson_title !== undefined) {
    updates.last_lesson_title = progress.last_lesson_title;
  }

  if (progress.last_topic !== undefined) {
    updates.last_topic = progress.last_topic;
  }

  if (progress.title !== undefined) {
    updates.title = progress.title;
  }

  const { error } = await supabase
    .from('tutor_conversations')
    .update(updates)
    .eq('id', conversationId);

  if (error) {
    console.error(
      'updateTutorConversationProgress error:',
      error.message
    );

    return false;
  }

  return true;
}
