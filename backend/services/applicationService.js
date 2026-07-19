const supabase = require('../config/supabase');
const { generateApplicationId } = require('../utils/helpers');

const createApplication = async (data) => {
  let application_id;
  let attempts = 0;
  // Ensure unique application_id
  do {
    application_id = generateApplicationId();
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('application_id', application_id)
      .single();
    if (!existing) break;
    attempts++;
  } while (attempts < 5);

  const { data: result, error } = await supabase
    .from('applications')
    .insert([{ ...data, application_id }])
    .select('id, application_id, name, created_at')
    .single();

  if (error) throw error;
  return result;
};

const getApplications = async ({ search, gender, course, ncc_certificate, school_activity, sort, page, limit }) => {
  let query = supabase.from('applications').select('*', { count: 'exact' });

  if (search) {
    query = query.or(`name.ilike.%${search}%,whatsapp.ilike.%${search}%`);
  }
  if (gender) query = query.eq('gender', gender);
  if (course) query = query.ilike('course', `%${course}%`);
  if (ncc_certificate) query = query.eq('ncc_certificate', ncc_certificate);
  if (school_activity) query = query.eq('school_activity', school_activity);

  const sortMap = {
    oldest: { column: 'created_at', ascending: true },
    alpha: { column: 'name', ascending: true },
    newest: { column: 'created_at', ascending: false }
  };
  const { column, ascending } = sortMap[sort] || sortMap.newest;
  query = query.order(column, { ascending });

  const pageNum = parseInt(page) || 1;
  const pageSize = parseInt(limit) || 20;
  const from = (pageNum - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count, page: pageNum, limit: pageSize, totalPages: Math.ceil(count / pageSize) };
};

const getApplicationById = async (id) => {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

const updateApplication = async (id, updates) => {
  const { data, error } = await supabase
    .from('applications')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const deleteApplication = async (id) => {
  const { error } = await supabase.from('applications').delete().eq('id', id);
  if (error) throw error;
};

const getStatistics = async () => {
  const today = new Date().toISOString().split('T')[0];

  const [total, male, female, certs, todayApps] = await Promise.all([
    supabase.from('applications').select('id', { count: 'exact', head: true }),
    supabase.from('applications').select('id', { count: 'exact', head: true }).eq('gender', 'Male'),
    supabase.from('applications').select('id', { count: 'exact', head: true }).eq('gender', 'Female'),
    supabase.from('applications').select('id', { count: 'exact', head: true }).neq('ncc_certificate', 'NIL'),
    supabase.from('applications').select('id', { count: 'exact', head: true }).gte('created_at', `${today}T00:00:00`)
  ]);

  return {
    total: total.count || 0,
    male: male.count || 0,
    female: female.count || 0,
    certificate_holders: certs.count || 0,
    today: todayApps.count || 0
  };
};

const getAllForExport = async () => {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

module.exports = { createApplication, getApplications, getApplicationById, updateApplication, deleteApplication, getStatistics, getAllForExport };
