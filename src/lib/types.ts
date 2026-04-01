export type UserStatus = 'available' | 'driving' | 'resting' | 'dnd';
export type VisibilityMode = 'visible_nearby' | 'visible_channels' | 'hidden';
export type TargetType = 'user' | 'message';
export type MessageType = 'text' | 'voice' | 'location';
export type Language = 'en' | 'ru' | 'ka' | 'es' | 'uk' | 'pl' | 'hi' | 'am';

export interface AppUser {
  id: string;
  email: string;
  language: Language;
  created_at: string;
}

export interface DriverProfile {
  id: string;
  user_id: string;
  display_name: string;
  photo_url?: string | null;
  truck_type?: string | null;
  bio?: string | null;
  status: UserStatus;
  visibility_mode: VisibilityMode;
  dnd_enabled: boolean;
  is_verified?: boolean;
  created_at: string;
}

export interface DriverPresence {
  id: string;
  user_id: string;
  lat: number | null;
  lng: number | null;
  current_route?: string | null;
  heading?: number | null;
  last_seen_at: string;
  is_visible: boolean;
  status: UserStatus;
}

export interface DriverWithProfile extends DriverPresence {
  driver_profiles?: DriverProfile;
}

export interface RouteChannel {
  id: string;
  route_name: string;
  route_code: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface RouteMessage {
  id: string;
  channel_id: string;
  sender_user_id: string;
  text_content: string;
  message_type?: MessageType;
  media_url?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  created_at: string;
  sender?: DriverProfile;
}

export interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  text_content: string;
  message_type?: MessageType;
  media_url?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  is_read: boolean;
  created_at: string;
  sender?: DriverProfile;
}

export interface Conversation {
  other_user_id: string;
  other_profile: DriverProfile;
  last_message: DirectMessage;
  unread_count: number;
}

export interface BlockedUser {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}
