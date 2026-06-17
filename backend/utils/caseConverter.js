/**
 * Utility to convert snake_case Supabase rows to camelCase
 * for API compatibility with the frontend.
 */

function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Recursively transform all keys of an object (or array of objects)
 * from snake_case to camelCase.
 */
function toCamelCase(obj) {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = snakeToCamel(key);
      result[camelKey] = toCamelCase(value);
    }
    return result;
  }
  return obj;
}

module.exports = { toCamelCase };
