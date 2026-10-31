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
  | 'verify';

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
    data?: unknown;
  };

  if (body.action === 'verify') {
    return res.status(200).json({
      ok: true,
      email: userEmail,
    });
  }

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
    const table = body.resource;

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

    const { error } = await adminClient
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