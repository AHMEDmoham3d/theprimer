import { FileText, Download, Eye } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { PROGRESS_REPORTS, STUDENTS } from '@/data/mockData';

export function TeacherReports() {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-[#181818] to-[#141414]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-black">
            <FileText size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">التقارير</h2>
            <p className="text-sm text-neutral-400 mt-0.5">تقارير نهاية الترم واكتشاف المهارات</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {PROGRESS_REPORTS.map((report) => {
          const student = STUDENTS.find((s) => s.id === report.studentId);
          return (
            <Card key={report.id} className="flex flex-col">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">{report.studentName}</h3>
                  <p className="text-xs text-neutral-500">{report.term}</p>
                </div>
                <Badge variant="success">جاهز</Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="rounded-xl bg-[#141414] p-3 text-center">
                  <p className="text-2xl font-bold text-white">{report.totalSessions}</p>
                  <p className="text-[10px] text-neutral-500 mt-1">جلسات</p>
                </div>
                <div className="rounded-xl bg-[#141414] p-3 text-center">
                  <p className="text-2xl font-bold text-white">{report.activeLearningHours}س</p>
                  <p className="text-[10px] text-neutral-500 mt-1">ساعات تعلم</p>
                </div>
                <div className="rounded-xl bg-[#141414] p-3 text-center">
                  <p className="text-2xl font-bold text-white">{report.attendanceRate}%</p>
                  <p className="text-[10px] text-neutral-500 mt-1">حضور</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div>
                  <p className="text-xs text-neutral-500 mb-1">أسرع المواضيع إتقاناً</p>
                  <div className="flex flex-wrap gap-1.5">
                    {report.fastestTopics.map((t) => <Badge key={t} variant="success" className="text-[10px]">{t}</Badge>)}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">المهارة المقترحة</p>
                  <Badge variant="info">{report.suggestedSkill}</Badge>
                </div>
              </div>

              <div className="mt-auto flex gap-2">
                <Button variant="secondary" className="flex-1 text-xs"><Eye size={14} /> عرض</Button>
                <Button variant="secondary" className="flex-1 text-xs"><Download size={14} /> تحميل</Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Button({ children, variant = 'primary', className = '' }: { children: React.ReactNode; variant?: 'primary' | 'secondary'; className?: string }) {
  return variant === 'primary' ? <button className={`btn-primary ${className}`}>{children}</button> : <button className={`btn-secondary ${className}`}>{children}</button>;
}
