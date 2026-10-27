export type SocialPlatform = 
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'kwai'
  | 'wordpress'
  | 'autoblog'
  | 'newsletter'
  | 'whatsapp'
  | 'telegram'
  | 'x_twitter'
  | 'threads';

export type PostStatus = 'draft' | 'scheduled' | 'processing' | 'published' | 'failed';

export type MediaType = 'image' | 'video' | 'carousel' | 'text';

export interface PlatformConfig {
  id: SocialPlatform;
  name: string;
  category: 'social' | 'blog' | 'messaging' | 'email';
  color: string;
  badgeBg: string;
  badgeText: string;
  maxChars?: number;
  supportsMedia: boolean;
}

export interface ScheduledPost {
  id: string;
  title: string;
  content: string;
  platforms: SocialPlatform[];
  scheduledAt: string;
  status: PostStatus;
  mediaUrl?: string;
  mediaType?: MediaType;
  tags: string[];
  retryCount?: number;
  lastError?: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NewsletterIssue {
  id: string;
  subject: string;
  previewText: string;
  contentMarkdown: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  targetAudience: 'all' | 'free_subscribers' | 'paid_vip_members';
  paywallBreakIndex?: number;
  sendAt: string;
  status: 'draft' | 'scheduled' | 'sent';
  openRateEstimated?: number;
  clickRateEstimated?: number;
  resendMessageId?: string;
  createdAt?: string;
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
  lastTriggeredAt?: string;
}

export interface CommentTriggerEvent {
  id: string;
  ruleId: string;
  platform: 'instagram' | 'tiktok';
  username: string;
  commentId: string;
  commentText: string;
  matchedKeyword: string;
  publicReplySent: string;
  dmSent: string;
  timestamp: string;
  status: 'success' | 'throttled' | 'failed';
}

export interface GroupBroadcastDeal {
  id: string;
  productName: string;
  store: 'Shopee' | 'Mercado Livre' | 'Amazon' | 'AliExpress' | 'Magalu';
  originalPrice: number;
  promoPrice: number;
  discountPercentage: number;
  savingsAmount?: number;
  couponCode?: string;
  affiliateUrl: string;
  targetChannels: Array<'whatsapp' | 'telegram'>;
  scheduledTime: string;
  status: 'pending' | 'sent' | 'failed';
  totalClicks?: number;
}

export interface MultimodalDispatchPayload {
  id: string;
  title: string;
  slug: string;
  summary: string;
  contentMarkdown: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  emailOptions: {
    enabled: boolean;
    subject: string;
    previewText: string;
    fromName: string;
    provider: 'resend' | 'ses' | 'smtp';
    audienceList: string;
    utmCampaign: string;
    footerAddress?: string;
    permissionReminder?: string;
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

export interface DispatchLogEntry {
  id: string;
  timestamp: string;
  channel: SocialPlatform;
  action: 'publish' | 'schedule' | 'comment_reply' | 'dm_dispatch' | 'group_broadcast';
  status: 'success' | 'failed' | 'in_progress';
  statusCode: number;
  message: string;
  payloadSummary: string;
  latencyMs?: number;
}

export interface DispatchAnalyticsSummary {
  totalDispatched: number;
  successRate: number;
  dmsSentCount: number;
  totalReachEstimated: number;
  activeAutomations: number;
  pendingQueueCount: number;
}
