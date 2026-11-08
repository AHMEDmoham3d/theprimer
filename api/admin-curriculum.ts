
import type {
  VercelRequest,
  VercelResponse,
} from '@vercel/node';

import { createClient } from '@supabase/supabase-js';

type Resource =
  | 'curricula'
  | 'curriculum_grades'
  | 'curriculum_grade_subjects'
  | 'curriculum_units'
  | 'curriculum_lessons';

type Action =
  | 'create'
  | 'update'
  | 'delete'
  | 'verify'
  | 'update_publication_settings'
  | 'list_students'
  | 'update_student_content_access';

const RESOURCE_COLUMNS: Record<Resource, string[]> = {
  curricula: [
    'name',
    'name_ar',
    'grade',
    'stage',
    'description',
  ],

  curriculum_grades: [
    'curriculum_id',
    'stage',
    'grade_code',
    'grade_name',
    'grade_name_ar',
    'sort_order',
    'is_active',
  ],

  curriculum_grade_subjects: [
    'curriculum_id',
    'stage',
    'grade',
    'subject_key',
    'subject_name',
    'subject_name_ar',
    'sort_order',
    'is_active',
  ],

  curriculum_units: [
    'subject_id',
    'name',
    'name_ar',
    'sort_order',
    'term',
  ],

  curriculum_lessons: [
    'unit_id',
    'name',
    'name_ar',
    'content',
    'sort_order',
  ],
};

function sendError(
  res: VercelResponse,
  status: number,
  message: string
) {
  return res.status(status).json({
    error: message,
  });
}

function getAllowedAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean);
}

function sanitizePayload(
  resource: Resource,
  value: unknown
): Record<string, unknown> {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value)
  ) {
    throw new Error('Invalid request data.');
  }

  const input = value as Record<string, unknown>;
  const allowed = RESOURCE_COLUMNS[resource];

  const payload: Record<string, unknown> = {};

  for (const column of allowed) {
    if (
      Object.prototype.hasOwnProperty.call(
        input,
        column
      )
    ) {
      payload[column] = input[column];
    }
  }

  if (Object.keys(payload).length === 0) {
    throw new Error(
      'No valid fields were supplied.'
    );
  }

  if (
    'name' in payload &&
    (
      typeof payload.name !== 'string' ||
      !payload.name.trim()
    )
  ) {
    throw new Error(
      'The name field is required.'
    );
  }

  if (
    'name_ar' in payload &&
    payload.name_ar !== null &&
    typeof payload.name_ar !== 'string'
  ) {
    throw new Error(
      'The Arabic name must be text or null.'
    );
  }

  if (
    'content' in payload &&
    typeof payload.content !== 'string'
  ) {
    throw new Error(
      'Lesson content must be text.'
    );
  }

  if (
    'sort_order' in payload &&
    (
      !Number.isInteger(payload.sort_order) ||
      Number(payload.sort_order) < 0
    )
  ) {
    throw new Error(
      'sort_order must be a non-negative integer.'
    );
  }

  if (
    'term' in payload &&
    !['first', 'second', 'full_year'].includes(
      String(payload.term)
    )
  ) {
    throw new Error(
      'term must be first, second, or full_year.'
    );
  }

  return payload;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');

    return sendError(
      res,
      405,
      'Method not allowed.'
    );
  }

  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL;

  const anonKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  const allowedEmails =
    getAllowedAdminEmails();

  if (
    !supabaseUrl ||
    !anonKey ||
    !serviceRoleKey ||
    allowedEmails.length === 0
  ) {
    return sendError(
      res,
      500,
      'Admin API is not configured. Check server environment variables.'
    );
  }

  // Verify the authenticated admin session.
  const authorization =
    req.headers.authorization;

  const accessToken =
    typeof authorization === 'string' &&
    authorization.startsWith('Bearer ')
      ? authorization.slice(7).trim()
      : '';

  if (!accessToken) {
    return sendError(
      res,
      401,
      'A valid Supabase session is required.'
    );
  }

  const authClient = createClient(
    supabaseUrl,
    anonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );

  const {
    data: authData,
    error: authError,
  } = await authClient.auth.getUser(accessToken);

  if (authError || !authData.user) {
    return sendError(
      res,
      401,
      'Your session is invalid or has expired. Please sign in again.'
    );
  }

  const userEmail =
    authData.user.email?.toLowerCase();

  if (
    !userEmail ||
    !authData.user.email_confirmed_at ||
    !allowedEmails.includes(userEmail)
  ) {
    return sendError(
      res,
      403,
      'This account is not authorized to access the admin tools.'
    );
  }

  const body = (req.body || {}) as {
    action?: Action;
    resource?: Resource;
    id?: string;
    student_id?: string;
    content_access_enabled?: boolean;
    data?: unknown;
  };

  if (body.action === 'verify') {
    return res.status(200).json({
      ok: true,
      email: userEmail,
    });
  }

  // Admin-only database client.
  // The service role key must remain on the server.
  const adminClient = createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );

  try {

    // ==========================================
    // STUDENT MANAGEMENT
    // ==========================================

    // Fetch real students from Supabase.
    if (body.action === 'list_students') {

      const {
        data,
        error,
      } = await adminClient
        .from('students')
        .select(
          `
          id,
          name,
          grade,
          stage,
          grade_code,
          school_name,
          email,
          student_email,
          parent_name,
          subscription_status,
          content_access_enabled,
          created_at
          `
        )
        .order('created_at', {
          ascending: false,
        });

      if (error) {
        return sendError(
          res,
          400,
          error.message
        );
      }

      return res.status(200).json({
        data: data || [],
      });
    }

    // Enable or disable content access
    // for one specific student.
    if (
      body.action ===
      'update_student_content_access'
    ) {

      if (
        typeof body.student_id !== 'string' ||
        !body.student_id.trim()
      ) {
        return sendError(
          res,
          400,
          'A valid student_id is required.'
        );
      }

      if (
        typeof body.content_access_enabled !==
        'boolean'
      ) {
        return sendError(
          res,
          400,
          'content_access_enabled must be true or false.'
        );
      }

      const {
        data,
        error,
      } = await adminClient
        .from('students')
        .update({
          content_access_enabled:
            body.content_access_enabled,

          updated_at:
            new Date().toISOString(),
        })
        .eq('id', body.student_id)
        .select(
          `
          id,
          name,
          grade,
          stage,
          grade_code,
          school_name,
          email,
          student_email,
          parent_name,
          subscription_status,
          content_access_enabled,
          created_at
          `
        )
        .maybeSingle();

      if (error) {
        return sendError(
          res,
          400,
          error.message
        );
      }

      if (!data) {
        return sendError(
          res,
          404,
          'Student was not found.'
        );
      }

      return res.status(200).json({
        data,
      });
    }

    // ==========================================
    // GLOBAL CURRICULUM PUBLICATION SETTINGS
    // ==========================================

    if (
      body.action ===
      'update_publication_settings'
    ) {

      if (
        !body.data ||
        typeof body.data !== 'object' ||
        Array.isArray(body.data)
      ) {
        return sendError(
          res,
          400,
          'Invalid publication settings data.'
        );
      }

      const settings =
        body.data as Record<string, unknown>;

      if (
        settings.current_term !== 'first' &&
        settings.current_term !== 'second'
      ) {
        return sendError(
          res,
          400,
          'current_term must be first or second.'
        );
      }

      const {
        data,
        error,
      } = await adminClient
        .from('curriculum_publication_settings')
        .upsert(
          {
            id: 'global',
            current_term: settings.current_term,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'id',
          }
        )
        .select('*')
        .single();

      if (error) {
        return sendError(
          res,
          400,
          error.message
        );
      }

      return res.status(200).json({
        data,
      });
    }

    // ==========================================
    // CURRICULUM MANAGEMENT
    // ==========================================

    const resources: Resource[] = [
      'curricula',
      'curriculum_grades',
      'curriculum_grade_subjects',
      'curriculum_units',
      'curriculum_lessons',
    ];

    if (
      !body.resource ||
      !resources.includes(body.resource)
    ) {
      return sendError(
        res,
        400,
        'Unsupported curriculum resource.'
      );
    }

    if (
      !['create', 'update', 'delete'].includes(
        body.action || ''
      )
    ) {
      return sendError(
        res,
        400,
        'Unsupported action.'
      );
    }

    if (
      (
        body.action === 'update' ||
        body.action === 'delete'
      ) &&
      !body.id
    ) {
      return sendError(
        res,
        400,
        'A record id is required.'
      );
    }

    const table = body.resource;

    // Create a curriculum record.
    if (body.action === 'create') {

      const payload = sanitizePayload(
        table,
        body.data
      );

      const {
        data,
        error,
      } = await adminClient
        .from(table)
        .insert(payload)
        .select('*')
        .single();

      if (error) {
        return sendError(
          res,
          400,
          error.message
        );
      }

      return res.status(201).json({
        data,
      });
    }

    // Update a curriculum record.
    if (body.action === 'update') {

      const payload = sanitizePayload(
        table,
        body.data
      );

      if (
        table === 'curriculum_units' ||
        table === 'curriculum_lessons'
      ) {
        payload.updated_at =
          new Date().toISOString();
      }

      const {
        data,
        error,
      } = await adminClient
        .from(table)
        .update(payload)
        .eq('id', body.id as string)
        .select('*')
        .single();

      if (error) {
        return sendError(
          res,
          400,
          error.message
        );
      }

      return res.status(200).json({
        data,
      });
    }

    // Delete a curriculum record.
    const {
      error,
    } = await adminClient
      .from(table)
      .delete()
      .eq('id', body.id as string);

    if (error) {
      return sendError(
        res,
        400,
        error.message
      );
    }

    return res.status(200).json({
      ok: true,
    });

  } catch (error) {

    return sendError(
      res,
      400,
      error instanceof Error
        ? error.message
        : 'Invalid request.'
    );
  }
}
