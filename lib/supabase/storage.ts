import { createClient } from "./client"

export interface UploadOptions {
  bucket: string
  path: string
  file: File
  upsert?: boolean
}

export interface UploadResult {
  url: string | null
  error: Error | null
}

export async function uploadFile({ bucket, path, file, upsert = false }: UploadOptions): Promise<UploadResult> {
  const supabase = createClient()

  try {
    console.log('[v0] Uploading file to storage - bucket:', bucket, 'path:', path, 'fileSize:', file.size)
    
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert,
    })

    if (error) {
      console.error('[v0] Storage upload error:', error)
      return { url: null, error }
    }

    console.log('[v0] File uploaded successfully, getting public URL')

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(data.path)

    console.log('[v0] Public URL obtained:', publicUrl)

    return { url: publicUrl, error: null }
  } catch (error) {
    console.error('[v0] Upload exception:', error)
    return { url: null, error: error as Error }
  }
}

export async function deleteFile(bucket: string, path: string): Promise<{ error: Error | null }> {
  const supabase = createClient()

  try {
    const { error } = await supabase.storage.from(bucket).remove([path])
    return { error }
  } catch (error) {
    return { error: error as Error }
  }
}

export async function listFiles(bucket: string, path = "") {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.storage.from(bucket).list(path)
    return { files: data, error }
  } catch (error) {
    return { files: null, error: error as Error }
  }
}

export function getPublicUrl(bucket: string, path: string): string {
  const supabase = createClient()
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path)
  return publicUrl
}
