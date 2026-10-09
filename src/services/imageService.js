import { supabaseUrl } from './supabase'

const STORAGE_BUCKET = 'website-images'

export const getWebsiteImageUrl = (path) => {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/')
  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${encodedPath}`
}