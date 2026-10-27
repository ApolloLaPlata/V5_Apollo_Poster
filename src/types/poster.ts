export type SocialPlatform = 
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'wordpress'
  | 'autoblog'
  | 'newsletter'
  | 'whatsapp'
  | 'telegram'
  | 'x_twitter'
  | 'threads';

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

export interface MultimodalDispatchPayload {
  id: string;
  title: string;
  slug: string;
  summary: string;
  contentMarkdown: string;
  emailOptions: {
    enabled: boolean;
    subject: string;
    previewText: string;
    fromName: string;
    provider: 'resend' | 'ses' | 'smtp';
    audienceList: string;
    utmCampaign: string;
  };
  blogOptions: {
    enabled: boolean;
    targetPlatform: 'v5autoblog' | 'wordpress' | 'both';
    targetEndpoint: string;
    category: string;
    tags: string[];
    author: string;
    generateSchema: boolean;
  };
  socialTeaserOptions: {
    enabled: boolean;
    platforms: Array<'instagram' | 'x_twitter' | 'threads' | 'telegram' | 'whatsapp'>;
    customHook?: string;
  };
  dispatchStatus: {
    overall: 'idle' | 'in_progress' | 'completed' | 'partial_error';
    email: { status: 'idle' | 'sent' | 'failed'; sentCount?: number; messageId?: string; error?: string };
    blog: { status: 'idle' | 'sent' | 'failed'; publishedUrl?: string; statusCode?: number; error?: string };
    social: { status: 'idle' | 'sent' | 'failed'; deliveredChannels?: string[]; error?: string };
  };
}
