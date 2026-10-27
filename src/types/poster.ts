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

export type EmailProviderType = 'resend' | 'ses' | 'smtp';

export interface ResendProviderConfig {
  apiKey: string;
  domain: string;
  replyTo?: string;
}

export interface SesProviderConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  configurationSet?: string;
}

export interface SmtpProviderConfig {
  host: string;
  port: number;
  user: string;
  password?: string;
  secure: boolean;
}

export interface EmailProviderProfile {
  id: EmailProviderType;
  name: string;
  badge: string;
  description: string;
  speed: string;
  quotaDaily: string;
  isReady: boolean;
  resend?: ResendProviderConfig;
  ses?: SesProviderConfig;
  smtp?: SmtpProviderConfig;
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
  targetPostTitle?: string;
  matchMode?: 'contains' | 'exact' | 'fuzzy' | 'regex';
  keywords: string[];
  publicReplyVariants: string[];
  dmMessageTemplate: string;
  ctaUrl: string;
  couponCode?: string;
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
  couponUsed?: string;
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
  shortUrl?: string;
  shortCode?: string;
  trackedTelegramUrl?: string;
  trackedWhatsAppUrl?: string;
  targetChannels: Array<'whatsapp' | 'telegram'>;
  targetChannelIds?: string[];
  estimatedReach?: number;
  scheduledTime: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  totalClicks?: number;
}

export interface WordPressSiteConfig {
  siteUrl: string;
  username: string;
  applicationPassword?: string;
  status?: 'publish' | 'draft' | 'pending';
}

export interface MultimodalDispatchPayload {
  id: string;
  title: string;
  slug: string;
  canonical_url?: string;
  summary: string;
  contentMarkdown: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  emailOptions: {
    enabled: boolean;
    subject: string;
    previewText: string;
    fromName: string;
    provider: EmailProviderType;
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
    capitaniaKey?: string;
    wordpressConfig?: WordPressSiteConfig;
  };
  socialTeaserOptions: {
    enabled: boolean;
    platforms: Array<'instagram' | 'x_twitter' | 'threads' | 'telegram' | 'whatsapp'>;
    customHook?: string;
  };
  dispatchStatus: {
    overall: 'idle' | 'in_progress' | 'completed' | 'partial_error';
    email: { status: 'idle' | 'sent' | 'failed'; sentCount?: number; messageId?: string; error?: string };
    blog: { 
      status: 'idle' | 'sent' | 'failed'; 
      publishedUrl?: string; 
      statusCode?: number; 
      wordpressUrl?: string;
      wordpressStatusCode?: number;
      error?: string 
    };
    social: { status: 'idle' | 'sent' | 'failed'; deliveredChannels?: string[]; error?: string };
  };
}

export interface BlogAuthorProfile {
  name: string;
  role?: string;
  avatarUrl?: string;
  profileUrl?: string;
}

export interface BlogFeaturedImage {
  url: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}

export interface OpenGraphMetadata {
  og_title: string;
  og_description: string;
  og_url: string;
  og_type: 'article';
  og_image: string;
  og_image_alt: string;
  og_image_width?: number;
  og_image_height?: number;
  og_site_name: string;
  og_locale: string;
  article_published_time: string;
  article_modified_time?: string;
  article_author: string;
  article_section: string;
  article_tag: string[];
}

export interface TwitterCardMetadata {
  card: 'summary_large_image' | 'summary';
  title: string;
  description: string;
  image: string;
  image_alt?: string;
  creator: string;
  site: string;
}

export interface SchemaOrgBlogPosting {
  '@context': 'https://schema.org';
  '@type': 'BlogPosting' | 'Article' | 'TechArticle';
  headline: string;
  description: string;
  articleBody: string;
  inLanguage: string;
  mainEntityOfPage: {
    '@type': 'WebPage';
    '@id': string;
  };
  author: {
    '@type': 'Person';
    name: string;
    url?: string;
  };
  publisher: {
    '@type': 'Organization';
    name: string;
    logo: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  datePublished: string;
  dateModified: string;
  image: {
    '@type': 'ImageObject';
    url: string;
    width: number;
    height: number;
  };
  keywords: string;
  wordCount: number;
  articleSection: string;
  isAccessibleForFree?: boolean;
  hasPart?: {
    '@type': 'WebPageElement';
    isAccessibleForFree: boolean;
    cssSelector: string;
  };
  timeRequired?: string;
  speakable?: {
    '@type': 'SpeakableSpecification';
    cssSelector: string[];
  };
}

export interface SchemaOrgBreadcrumbList {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }>;
}

export interface AiSearchReadiness {
  topic_cluster: string;
  key_takeaways: string[];
  content_freshness: 'evergreen' | 'breaking_news' | 'technical_guide';
  citation_anchor: string;
  direct_answer_summary: string;
}

export interface ExtendedSeoMetadata {
  meta_title: string;
  meta_description: string;
  canonical_url: string;
  focus_keywords: string[];
  reading_time_minutes: number;
  word_count: number;
  robots: string;
  open_graph: OpenGraphMetadata;
  twitter_card: TwitterCardMetadata;
  schema_org: SchemaOrgBlogPosting;
  ai_search: AiSearchReadiness;
}

export interface V5AutoBlogPayload {
  id: string;
  title: string;
  slug: string;
  canonical_url: string;
  content: string;
  content_html: string;
  excerpt: string;
  category: string;
  tags: string[];
  status: 'publish' | 'draft' | 'future';
  published_at: string;
  updated_at: string;
  author: BlogAuthorProfile;
  featured_image: BlogFeaturedImage;
  has_paywall: boolean;
  paywall_index?: number;
  reading_time_minutes: number;
  word_count: number;
  seo: ExtendedSeoMetadata;
  target_platform: 'v5autoblog' | 'wordpress' | 'both';
  target_endpoint: string;
  api_version: string;
  dispatched_by: string;
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

export interface WordPressPostPayload {
  title: string;
  content: string;
  excerpt?: string;
  status: 'publish' | 'draft' | 'pending' | 'future';
  slug?: string;
  date?: string;
  categories?: number[];
  tags?: number[];
  featured_media?: number;
  comment_status?: 'open' | 'closed';
  ping_status?: 'open' | 'closed';
  meta?: Record<string, string | number | boolean>;
}

// ==========================================
// FASE 6: PONTA SOCIAL TEASERS (051 - 060)
// ==========================================
export type SocialTeaserPlatform = 'x_twitter' | 'threads' | 'instagram' | 'whatsapp' | 'telegram' | 'linkedin';

export interface SingleSocialTeaser {
  platform: SocialTeaserPlatform;
  platformName: string;
  text: string;
  charCount: number;
  charLimit: number;
  remainingChars: number;
  isWithinLimit: boolean;
  utmUrl: string;
  hashtags: string[];
  hookUsed: string;
}

export interface CompiledSocialTeasers {
  x_twitter: SingleSocialTeaser;
  threads: SingleSocialTeaser;
  instagram: SingleSocialTeaser;
  whatsapp: SingleSocialTeaser;
  telegram: SingleSocialTeaser;
  linkedin: SingleSocialTeaser;
  summary: {
    totalPlatforms: number;
    allWithinLimits: boolean;
    generatedAt: string;
  };
}

// ==========================================
// FASE 9: FILA DE AGENDAMENTO EM BACKGROUND (081 - 090)
// ==========================================
export type QueueItemPriority = 'urgent' | 'high' | 'normal' | 'low';

export type QueueItemStatus = 'scheduled' | 'queued' | 'processing' | 'published' | 'failed' | 'cancelled';

export type QueueItemType = 'post' | 'deal' | 'comment_dm' | 'webhook';

export interface QueueItem {
  id: string;
  entityId: string;
  entityType: QueueItemType;
  title: string;
  platforms: SocialPlatform[];
  scheduledFor: string; // ISO 8601 string
  priority: QueueItemPriority;
  status: QueueItemStatus;
  attempts: number;
  maxAttempts: number;
  lastAttemptAt?: string;
  nextAttemptAt?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  payload?: Record<string, unknown>;
}

export interface QueueStats {
  totalItems: number;
  scheduledCount: number;
  queuedCount: number;
  processingCount: number;
  publishedCount: number;
  failedCount: number;
  cancelledCount: number;
  activeCount: number;
  oldestScheduledAt?: string;
  nextScheduledAt?: string;
  averageWaitTimeSeconds: number;
}
