const { supabase } = require('../db');

const TABLE = 'robots';

module.exports = {
  async findAll(selectFields = '*') {
    const { data, error } = await supabase.from(TABLE).select(selectFields).order('robot_id', { ascending: true });
    if (error) throw error;
    return data;
  },

  async findById(id, selectFields = '*') {
    const { data, error } = await supabase.from(TABLE).select(selectFields).eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async findOne(filters = {}, selectFields = '*') {
    let query = supabase.from(TABLE).select(selectFields);
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }
    const { data, error } = await query.limit(1).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async findByLocation(locationId) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('location_id', locationId)
      .order('status', { ascending: true })
      .order('name', { ascending: true });
    if (error) throw error;
    return data;
  },

  async insertMany(rows) {
    const { data, error } = await supabase.from(TABLE).insert(rows).select();
    if (error) throw error;
    return data;
  },

  async deleteAll() {
    const { error } = await supabase.from(TABLE).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) throw error;
  },

  async count() {
    const { count, error } = await supabase.from(TABLE).select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count;
  },

  async countByStatus(status) {
    const { count, error } = await supabase.from(TABLE).select('*', { count: 'exact', head: true }).eq('status', status);
    if (error) throw error;
    return count;
  },

  async updateById(id, data) {
    const { data: updated, error } = await supabase
      .from(TABLE)
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return updated;
  },

  async sumTotalDistance() {
    const { data, error } = await supabase.rpc('sum_robot_total_distance');
    if (error) throw error;
    return data || 0;
  },
};
