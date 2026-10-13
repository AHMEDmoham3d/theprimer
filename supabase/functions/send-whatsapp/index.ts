import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MIN_INTERVAL_HOURS = 6;

async function canSend(supabase: ReturnType<typeof createClient>, studentId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("students")
    .select("last_whatsapp_sent")
    .eq("id", studentId)
    .maybeSingle();
  if (error || !data) return true;
  const lastSent = new Date(data.last_whatsapp_sent).getTime();
  const hoursSince = (Date.now() - lastSent) / (1000 * 60 * 60);
  return hoursSince >= MIN_INTERVAL_HOURS;
}

async function updateLastSent(supabase: ReturnType<typeof createClient>, studentId: string): Promise<void> {
  await supabase
    .from("students")
    .update({ last_whatsapp_sent: new Date().toISOString() })
    .eq("id", studentId);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, payload } = await req.json();

    if (action === "send-welcome") {
      const { student_id, student_name, parent_phone, parent_email, parent_name, student_phone, student_email, curriculum_name } = payload;

      const companyNumber = "+20 100 123 4567";
      const messages: Array<Record<string, unknown>> = [];

      const allowed = student_id ? await canSend(supabase, student_id) : true;
      if (!allowed) {
        return new Response(
          JSON.stringify({ success: false, reason: "pacing_throttled", message: "تم إرسال رسالة مؤخراً — سيتم المحاولة لاحقاً" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (parent_phone) {
        const content = `أهلاً بك في The Primer! ابنك ${student_name} تم تسجيله بنجاح في المنهج: ${curriculum_name || "سيتم تحديده"}. مدرّسه الشخصي جاهز 24/7. رقم المساعدة: ${companyNumber}`;
        const { data, error } = await supabase.from("whatsapp_messages").insert({
          student_id,
          student_name,
          recipient: "parent",
          recipient_phone: parent_phone,
          recipient_name: parent_name || "ولي الأمر",
          recipient_email: parent_email || "",
          content,
          trigger_type: "welcome",
          status: "sent",
          company_sending_number: companyNumber,
        }).select().single();

        if (!error && data) messages.push(data);
      }

      if (student_phone) {
        const content = `أهلاً ${student_name}! مدرّسك الشخصي في The Primer جاهز. اسأل أي سؤال في أي وقت — أنا هنا 24/7.`;
        const { data, error } = await supabase.from("whatsapp_messages").insert({
          student_id,
          student_name,
          recipient: "student",
          recipient_phone: student_phone,
          recipient_name: student_name,
          recipient_email: student_email || "",
          content,
          trigger_type: "welcome",
          status: "sent",
          company_sending_number: companyNumber,
        }).select().single();

        if (!error && data) messages.push(data);
      }

      if (student_id && messages.length > 0) {
        await updateLastSent(supabase, student_id);
      }

      return new Response(
        JSON.stringify({ success: true, messages_sent: messages.length, messages }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "send-template") {
      const { template_id, student_id } = payload;

      const { data: tpl, error: tplErr } = await supabase
        .from("whatsapp_templates")
        .select("*")
        .eq("id", template_id)
        .maybeSingle();

      if (tplErr || !tpl) {
        return new Response(
          JSON.stringify({ error: "Template not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!tpl.enabled) {
        return new Response(
          JSON.stringify({ error: "Template is disabled" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: student, error: stErr } = await supabase
        .from("students")
        .select("*")
        .eq("id", student_id)
        .maybeSingle();

      if (stErr || !student) {
        return new Response(
          JSON.stringify({ error: "Student not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const allowed = await canSend(supabase, student_id);
      if (!allowed) {
        return new Response(
          JSON.stringify({ success: false, reason: "pacing_throttled", message: "تم إرسال رسالة مؤخراً — انتظر قبل الإرسال مرة أخرى" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const phone = tpl.recipient === "student" ? student.student_phone : student.parent_phone;
      const email = tpl.recipient === "student" ? student.student_email : student.parent_email;
      const name = tpl.recipient === "student" ? student.name : student.parent_name;

      if (!phone) {
        return new Response(
          JSON.stringify({ error: "No phone number registered for this recipient" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      let content = tpl.template;
      const replacements: Record<string, string> = {
        student_name: student.name,
        subject: student.active_subject,
        curriculum: student.curriculum_name || "",
      };
      for (const [key, val] of Object.entries(replacements)) {
        content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), val);
      }

      const { data: msg, error: msgErr } = await supabase.from("whatsapp_messages").insert({
        student_id: student.id,
        student_name: student.name,
        recipient: tpl.recipient,
        recipient_phone: phone,
        recipient_name: name || "",
        recipient_email: email || "",
        content,
        trigger_type: tpl.trigger_type,
        status: "sent",
        company_sending_number: tpl.company_sending_number,
      }).select().single();

      if (msgErr) {
        return new Response(
          JSON.stringify({ error: "Failed to send message" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await updateLastSent(supabase, student_id);

      return new Response(
        JSON.stringify({ success: true, message: msg }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
