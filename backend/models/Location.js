const { supabase } = require('../db');

const TABLE = 'locations';

module.exports = {
  async findAll() {
    const { data, error } = await supabase.from(TABLE).select('*');
    if (error) throw error;
    return data;
  },

  async findById(id) {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
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
};
