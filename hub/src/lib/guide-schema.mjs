import { z } from 'astro/zod';
import { isHttpsUrl } from './content-rules.mjs';
export const guideSchema = z.object({
  contentId: z.string().regex(/^JAI-\d{8}-\d{3}$/), lang: z.enum(['en','ar']), translationOf: z.string().optional(),
  title: z.string().min(1).max(70), description: z.string().min(120).max(160), promise: z.string().min(1),
  pillar: z.enum(['fix-it','save-time','tools','in-a-minute','create','safety']), segment: z.enum(['beginners','students','professionals','older-adults','creators']),
  level: z.enum(['beginner','intermediate','advanced']), tools: z.array(z.string()).min(1), cost: z.string(), timeMinutes: z.number().int().positive(),
  verifiedOn: z.coerce.date(), updatedOn: z.coerce.date().optional(), sources: z.array(z.object({title:z.string(),url:z.url().refine(isHttpsUrl, 'Source URLs must use HTTPS'),accessed:z.coerce.date()})).min(1),
  riskLevel: z.enum(['LOW','MEDIUM','HIGH']), qaRecord:z.string(), primaryKeyword:z.string(), secondaryKeywords:z.array(z.string()), faq:z.array(z.object({q:z.string(),a:z.string()})),
  videoIds:z.array(z.object({youtube:z.string().regex(/^[\w-]+$/).optional(),instagram:z.string().regex(/^[\w-]+$/).optional()}).refine(v => Number(!!v.youtube) + Number(!!v.instagram) === 1, 'Provide exactly one video ID')).optional(), videoUploadDate:z.coerce.date().optional(), draft:z.boolean().default(false)
}).superRefine((guide, ctx) => {
  if (guide.riskLevel !== 'LOW' && !/^QA-APPROVED-JAI-\d{8}-\d{3}-\d{8}$/.test(guide.qaRecord))
    ctx.addIssue({code:'custom', message:'Non-LOW guides require a complete QA approval record', path:['qaRecord']});
  if (!guide.draft && !/^QA-(APPROVED-)?JAI-\d{8}-\d{3}-\d{8}$/.test(guide.qaRecord))
    ctx.addIssue({code:'custom', message:'Published guides require a complete QA record', path:['qaRecord']});
});
