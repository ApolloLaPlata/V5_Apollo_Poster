export type SocialPlatform = 
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'wordpress'
  | 'autoblog'
  | 'newsletter'
  | 'whatsapp'
  | 'telegram';

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

export interface ScheduledPost {
  id: string;
  title: string;
  content: string;
  platforms: SocialPlatform[];
  scheduledAt: string;
  status: PostStatus;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  tags: string[];
}

export interface NewsletterIssue {
  id: string;
  subject: string;
  previewText: string;
  contentMarkdown: string;
  targetAudience: string;
  sendAt: string;
  status: 'draft' | 'scheduled' | 'sent';
  openRateEstimated?: number;
}

export interface CommentRule {
  id: string;
  name: string;
  platform: 'instagram' | 'tiktok';
  targetPostId: string;
  keywords: string[];
  publicReplyVariants: string[];
  dmMessageTemplate: string;
  ctaUrl: string;
  isActive: boolean;
  totalTriggered: number;
}

export interface GroupBroadcastDeal {
  id: string;
  productName: string;
  store: 'Shopee' | 'Mercado Livre' | 'Amazon' | 'AliExpress' | 'Magalu';
  originalPrice: number;
  promoPrice: number;
  discountPercentage: number;
  couponCode?: string;
  affiliateUrl: string;
  targetChannels: Array<'whatsapp' | 'telegram'>;
  scheduledTime: string;
  status: 'pending' | 'sent';
}
