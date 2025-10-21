/* Convex schema for the LUPAH application */
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  students: defineTable({
    name: v.string(),
    dateOfBirth: v.string(),
    enrollmentDate: v.string(),
    grade: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("graduated"),
    ),
    notes: v.optional(v.string()),
    accessCodeHash: v.string(),
    intelligenceTypes: v.array(
      v.union(
        v.literal("logico-matematica"),
        v.literal("verbo-linguistica"),
        v.literal("linguagens"),
        v.literal("espacial"),
        v.literal("corporal-cinestesica"),
        v.literal("musical"),
        v.literal("interpessoal"),
        v.literal("intrapessoal"),
        v.literal("naturalista"),
        v.literal("existencial"),
        v.literal("memoria"),
        v.literal("espiritual"),
      ),
    ),
  })
    .index("status", ["status"])
    .index("grade", ["grade"])
    .index("accessCodeHash", ["accessCodeHash"]),

  studentDocuments: defineTable({
    studentId: v.id("students"),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileSize: v.number(),
    uploadedBy: v.string(),
    uploadDate: v.string(),
    isCurrent: v.boolean(),
    notes: v.optional(v.string()),
  })
    .index("studentId", ["studentId"])
    .index("studentId_isCurrent", ["studentId", "isCurrent"])
    .index("uploadDate", ["uploadDate"]),

  progressReports: defineTable({
    studentId: v.id("students"),
    reportDate: v.string(),
    period: v.string(),
    cognitiveSkills: v.object({
      score: v.number(),
      observations: v.optional(v.string()),
    }),
    socialEmotionalSkills: v.object({
      score: v.number(),
      observations: v.optional(v.string()),
    }),
    creativity: v.object({
      score: v.number(),
      observations: v.optional(v.string()),
    }),
    leadership: v.object({
      score: v.number(),
      observations: v.optional(v.string()),
    }),
    overallProgress: v.string(),
    generalObservations: v.string(),
    createdBy: v.string(),
  })
    .index("studentId", ["studentId"])
    .index("reportDate", ["reportDate"])
    .index("period", ["period"])
    .index("studentPeriod", ["studentId", "period"]),

  activities: defineTable({
    studentId: v.id("students"),
    activityDate: v.string(),
    title: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("workshop"),
      v.literal("assessment"),
      v.literal("project"),
      v.literal("event"),
      v.literal("other"),
    ),
    durationMinutes: v.optional(v.number()),
    attachments: v.optional(v.array(v.string())),
    createdBy: v.string(),
  })
    .index("studentId", ["studentId"])
    .index("activityDate", ["activityDate"])
    .index("type", ["type"])
    .index("studentDate", ["studentId", "activityDate"]),

  products: defineTable({
    title: v.string(),
    imageId: v.string(),
    price: v.number(),
  }),

  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
  }),
});
