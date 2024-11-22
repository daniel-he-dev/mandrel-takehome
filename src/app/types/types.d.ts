export interface SlackUser {
  id: number;
  slack_id: string;
  name?: string;
  email?: string;
  phone?: string;
  image?: string;
  timezone?: string;
  updated_at: Date;
  status_text?: string;
  title?: string;
  deleted: boolean;
}
