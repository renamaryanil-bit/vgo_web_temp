const { supabase } = require('../db');

const TABLE = 'rides';

module.exports = {
  async findAll() {
    const { data, error } = await supabase.from(TABLE).select('*');
    if (error) throw error;
    return data;
  },

  async findById(id, selectFields = '*') {
    const { data, error } = await supabase.from(TABLE).select(selectFields).eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async findByRobot(robotId, { limit = 20, offset = 0, selectFields = '*' } = {}) {
    const { data, error } = await supabase
      .from(TABLE)
      .select(selectFields)
      .eq('robot_id', robotId)
      .order('start_time', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return data;
  },

  async countByRobot(robotId) {
    const { count, error } = await supabase.from(TABLE).select('*', { count: 'exact', head: true }).eq('robot_id', robotId);
    if (error) throw error;
    return count;
  },

  async create(row) {
    const { data, error } = await supabase.from(TABLE).insert(row).select().single();
    if (error) throw error;
    return data;
  },

  async insertMany(rows) {
    // Supabase has a default row limit per insert; batch if needed
    const BATCH_SIZE = 500;
    const results = [];
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const { data, error } = await supabase.from(TABLE).insert(batch).select();
      if (error) throw error;
      results.push(...data);
    }
    return results;
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
};
