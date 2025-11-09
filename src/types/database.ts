export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          card_uuid: string
          email: string | null
          first_name: string | null
          last_name: string | null
          title: string | null
          tagline: string | null
          bio: string | null
          linkedin: string | null
          instagram: string | null
          github: string | null
          website: string | null
          avatar_url: string | null
          signup_token: string | null
          auth_user_id: string | null
          email_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          card_uuid?: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          title?: string | null
          tagline?: string | null
          bio?: string | null
          linkedin?: string | null
          instagram?: string | null
          github?: string | null
          website?: string | null
          avatar_url?: string | null
          signup_token?: string | null
          auth_user_id?: string | null
          email_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          card_uuid?: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          title?: string | null
          tagline?: string | null
          bio?: string | null
          linkedin?: string | null
          instagram?: string | null
          github?: string | null
          website?: string | null
          avatar_url?: string | null
          signup_token?: string | null
          auth_user_id?: string | null
          email_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          email: string | null
          logo_url: string | null
          description: string | null
          website: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          email?: string | null
          logo_url?: string | null
          description?: string | null
          website?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          email?: string | null
          logo_url?: string | null
          description?: string | null
          website?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
      }
      reader_devices: {
        Row: {
          id: string
          organization_id: string
          name: string
          device_secret: string
          is_active: boolean
          last_seen_at: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          device_secret: string
          is_active?: boolean
          last_seen_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          device_secret?: string
          is_active?: boolean
          last_seen_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      application_types: {
        Row: {
          id: string
          organization_id: string
          slug: string
          title: string
          description: string | null
          questions: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          slug: string
          title: string
          description?: string | null
          questions?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          slug?: string
          title?: string
          description?: string | null
          questions?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      informal_applications: {
        Row: {
          id: string
          user_id: string
          card_uuid: string
          organization_id: string
          reader_device_id: string | null
          application_type_id: string | null
          status: string
          public_token: string
          token_expires_at: string | null
          payload: Json
          metadata: Json
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          card_uuid: string
          organization_id: string
          reader_device_id?: string | null
          application_type_id?: string | null
          status?: string
          public_token: string
          token_expires_at?: string | null
          payload?: Json
          metadata?: Json
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          card_uuid?: string
          organization_id?: string
          reader_device_id?: string | null
          application_type_id?: string | null
          status?: string
          public_token?: string
          token_expires_at?: string | null
          payload?: Json
          metadata?: Json
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      analytics_events: {
        Row: {
          id: number
          organization_id: string | null
          user_id: string | null
          application_id: string | null
          event_type: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: number
          organization_id?: string | null
          user_id?: string | null
          application_id?: string | null
          event_type: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: number
          organization_id?: string | null
          user_id?: string | null
          application_id?: string | null
          event_type?: string
          metadata?: Json
          created_at?: string
        }
      }
    }
  }
}

