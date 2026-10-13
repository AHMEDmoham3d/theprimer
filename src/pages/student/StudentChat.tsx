import { TeacherChat } from '@/components/chat/TeacherChat';
import { CHAT_MESSAGES, CURRENT_STUDENT } from '@/data/mockData';

export function StudentChat() {
  return <TeacherChat messages={CHAT_MESSAGES} studentName={CURRENT_STUDENT.name.split(' ')[0]} />;
}
