export function parseTagsInput(value) {
  if (!value) return []
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean)
  }
  return String(value)
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}
