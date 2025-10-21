// Convex functions for student data management

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  generateAccessCode,
  hashAccessCode,
  isValidAccessCodeFormat,
  validateAccessCode,
} from "./lib/crypto";

// Validate student access code and return student data
export const validateStudentAccessCode = mutation({
  args: {
    accessCode: v.string(),
  },
  handler: async (ctx, args) => {
    if (!isValidAccessCodeFormat(args.accessCode)) {
      throw new Error(
        "Formato de código inválido. Use 8 caracteres alfanuméricos.",
      );
    }

    const students = await ctx.db.query("students").collect();

    for (const student of students) {
      const isValid = await validateAccessCode(
        args.accessCode,
        student.accessCodeHash,
      );

      if (isValid && student.status === "active") {
        // Get current document
        const currentDocument = await ctx.db
          .query("studentDocuments")
          .withIndex("studentId_isCurrent", (q) =>
            q.eq("studentId", student._id).eq("isCurrent", true),
          )
          .first();

        return {
          student: {
            _id: student._id,
            name: student.name,
            dateOfBirth: student.dateOfBirth,
            grade: student.grade,
            status: student.status,
            intelligenceTypes: student.intelligenceTypes,
            notes: student.notes,
          },
          currentDocument: currentDocument
            ? {
                _id: currentDocument._id,
                storageId: currentDocument.storageId,
                fileName: currentDocument.fileName,
                fileSize: currentDocument.fileSize,
                uploadDate: currentDocument.uploadDate,
                notes: currentDocument.notes,
              }
            : null,
        };
      }
    }

    throw new Error("Código de acesso inválido ou aluno inativo.");
  },
});

export const getStudent = query({
  args: {
    studentId: v.id("students"),
  },
  handler: async (ctx, args) => {
    const student = await ctx.db.get(args.studentId);

    if (!student) {
      throw new Error("Aluno não encontrado.");
    }

    const progressReports = await ctx.db
      .query("progressReports")
      .withIndex("studentId", (q) => q.eq("studentId", args.studentId))
      .order("desc")
      .take(5);

    const activities = await ctx.db
      .query("activities")
      .withIndex("studentId", (q) => q.eq("studentId", args.studentId))
      .order("desc")
      .take(10);

    const currentDocument = await ctx.db
      .query("studentDocuments")
      .withIndex("studentId_isCurrent", (q) =>
        q.eq("studentId", args.studentId).eq("isCurrent", true),
      )
      .first();

    return {
      student,
      progressReports,
      activities,
      currentDocument,
    };
  },
});

export const getStudentProgress = query({
  args: {
    studentId: v.id("students"),
    period: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const queryRef = ctx.db
      .query("progressReports")
      .withIndex("studentId", (q) => q.eq("studentId", args.studentId));

    const reports = await queryRef.order("desc").collect();

    const filteredReports = args.period
      ? reports.filter((r) => r.period === args.period)
      : reports;

    return filteredReports;
  },
});

export const getStudentActivities = query({
  args: {
    studentId: v.id("students"),
    type: v.optional(
      v.union(
        v.literal("workshop"),
        v.literal("assessment"),
        v.literal("project"),
        v.literal("event"),
        v.literal("other"),
      ),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const queryRef = ctx.db
      .query("activities")
      .withIndex("studentId", (q) => q.eq("studentId", args.studentId))
      .order("desc");

    const activities = await queryRef.collect();

    const filteredActivities = args.type
      ? activities.filter((a) => a.type === args.type)
      : activities;

    if (args.limit) {
      return filteredActivities.slice(0, args.limit);
    }

    return filteredActivities;
  },
});

export const createStudent = mutation({
  args: {
    name: v.string(),
    dateOfBirth: v.string(),
    enrollmentDate: v.string(),
    grade: v.string(),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("inactive"),
        v.literal("graduated"),
      ),
    ),
    notes: v.optional(v.string()),
    intelligenceTypes: v.optional(
      v.array(
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
    ),
  },
  handler: async (ctx, args) => {
    const accessCode = generateAccessCode();
    const accessCodeHash = await hashAccessCode(accessCode);

    const studentId = await ctx.db.insert("students", {
      name: args.name,
      dateOfBirth: args.dateOfBirth,
      enrollmentDate: args.enrollmentDate,
      grade: args.grade,
      status: args.status || "active",
      notes: args.notes,
      accessCodeHash,
      intelligenceTypes: args.intelligenceTypes || [],
    });

    return {
      studentId,
      accessCode,
      message: "Aluno criado com sucesso.",
    };
  },
});

export const updateStudent = mutation({
  args: {
    studentId: v.id("students"),
    name: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    grade: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("inactive"),
        v.literal("graduated"),
      ),
    ),
    notes: v.optional(v.string()),
    intelligenceTypes: v.optional(
      v.array(
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
    ),
  },
  handler: async (ctx, args) => {
    const { studentId, ...updates } = args;

    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined),
    );

    await ctx.db.patch(studentId, cleanUpdates);

    return {
      message: "Informações do aluno atualizadas com sucesso.",
    };
  },
});

export const regenerateAccessCode = mutation({
  args: {
    studentId: v.id("students"),
  },
  handler: async (ctx, args) => {
    const student = await ctx.db.get(args.studentId);

    if (!student) {
      throw new Error("Aluno não encontrado.");
    }

    const newAccessCode = generateAccessCode();
    const newAccessCodeHash = await hashAccessCode(newAccessCode);

    await ctx.db.patch(args.studentId, {
      accessCodeHash: newAccessCodeHash,
    });

    return {
      accessCode: newAccessCode,
      message: "Código de acesso regenerado com sucesso.",
    };
  },
});

export const addProgressReport = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    // Ensure scores are in the expected 0-10 range
    const scores = [
      args.cognitiveSkills.score,
      args.socialEmotionalSkills.score,
      args.creativity.score,
      args.leadership.score,
    ];

    for (const score of scores) {
      if (score < 0 || score > 10) {
        throw new Error("As pontuações devem estar entre 0 e 10.");
      }
    }

    const reportId = await ctx.db.insert("progressReports", {
      studentId: args.studentId,
      reportDate: args.reportDate,
      period: args.period,
      cognitiveSkills: args.cognitiveSkills,
      socialEmotionalSkills: args.socialEmotionalSkills,
      creativity: args.creativity,
      leadership: args.leadership,
      overallProgress: args.overallProgress,
      generalObservations: args.generalObservations,
      createdBy: args.createdBy,
    });

    return {
      reportId,
      message: "Relatório de progresso adicionado com sucesso.",
    };
  },
});

export const addActivity = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const activityId = await ctx.db.insert("activities", {
      studentId: args.studentId,
      activityDate: args.activityDate,
      title: args.title,
      description: args.description,
      type: args.type,
      durationMinutes: args.durationMinutes,
      attachments: args.attachments,
      createdBy: args.createdBy,
    });

    return {
      activityId,
      message: "Atividade adicionada com sucesso.",
    };
  },
});

export const listStudents = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("inactive"),
        v.literal("graduated"),
      ),
    ),
    grade: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const students = args.status
      ? await ctx.db
          .query("students")
          .withIndex("status", (q) => q.eq("status", args.status!))
          .collect()
      : await ctx.db.query("students").collect();

    const filteredStudents = args.grade
      ? students.filter((s) => s.grade === args.grade)
      : students;

    const studentsWithDocumentCount = await Promise.all(
      filteredStudents.map(async (student) => {
        const documents = await ctx.db
          .query("studentDocuments")
          .withIndex("studentId", (q) => q.eq("studentId", student._id))
          .collect();

        return {
          ...student,
          documentCount: documents.length,
        };
      }),
    );

    return studentsWithDocumentCount;
  },
});

export const getStudentStats = query({
  args: {
    studentId: v.id("students"),
  },
  handler: async (ctx, args) => {
    const reports = await ctx.db
      .query("progressReports")
      .withIndex("studentId", (q) => q.eq("studentId", args.studentId))
      .collect();

    const activities = await ctx.db
      .query("activities")
      .withIndex("studentId", (q) => q.eq("studentId", args.studentId))
      .collect();

    let avgCognitive = 0;
    let avgSocialEmotional = 0;
    let avgCreativity = 0;
    let avgLeadership = 0;

    if (reports.length > 0) {
      avgCognitive =
        reports.reduce((sum, r) => sum + r.cognitiveSkills.score, 0) /
        reports.length;
      avgSocialEmotional =
        reports.reduce((sum, r) => sum + r.socialEmotionalSkills.score, 0) /
        reports.length;
      avgCreativity =
        reports.reduce((sum, r) => sum + r.creativity.score, 0) /
        reports.length;
      avgLeadership =
        reports.reduce((sum, r) => sum + r.leadership.score, 0) /
        reports.length;
    }

    const totalActivityMinutes = activities.reduce(
      (sum, a) => sum + (a.durationMinutes || 0),
      0,
    );

    const activityCounts = {
      workshop: activities.filter((a) => a.type === "workshop").length,
      assessment: activities.filter((a) => a.type === "assessment").length,
      project: activities.filter((a) => a.type === "project").length,
      event: activities.filter((a) => a.type === "event").length,
      other: activities.filter((a) => a.type === "other").length,
    };

    return {
      totalReports: reports.length,
      totalActivities: activities.length,
      totalActivityHours: Math.round((totalActivityMinutes / 60) * 10) / 10,
      averageScores: {
        cognitive: Math.round(avgCognitive * 10) / 10,
        socialEmotional: Math.round(avgSocialEmotional * 10) / 10,
        creativity: Math.round(avgCreativity * 10) / 10,
        leadership: Math.round(avgLeadership * 10) / 10,
      },
      activityCounts,
    };
  },
});

// Get student documents with optional filtering
export const getStudentDocuments = query({
  args: {
    studentId: v.id("students"),
    currentOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.currentOnly) {
      const currentDoc = await ctx.db
        .query("studentDocuments")
        .withIndex("studentId_isCurrent", (q) =>
          q.eq("studentId", args.studentId).eq("isCurrent", true),
        )
        .first();

      return currentDoc ? [currentDoc] : [];
    }

    const documents = await ctx.db
      .query("studentDocuments")
      .withIndex("studentId", (q) => q.eq("studentId", args.studentId))
      .order("desc")
      .collect();

    return documents;
  },
});

// Generate upload URL for student document
export const generateDocumentUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Save uploaded document and set as current
export const saveStudentDocument = mutation({
  args: {
    studentId: v.id("students"),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileSize: v.number(),
    uploadedBy: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Set all existing documents for this student to not current
    const existingDocs = await ctx.db
      .query("studentDocuments")
      .withIndex("studentId", (q) => q.eq("studentId", args.studentId))
      .collect();

    for (const doc of existingDocs) {
      if (doc.isCurrent) {
        await ctx.db.patch(doc._id, { isCurrent: false });
      }
    }

    // Insert new document as current
    const documentId = await ctx.db.insert("studentDocuments", {
      studentId: args.studentId,
      storageId: args.storageId,
      fileName: args.fileName,
      fileSize: args.fileSize,
      uploadedBy: args.uploadedBy,
      uploadDate: new Date().toISOString(),
      isCurrent: true,
      notes: args.notes,
    });

    return {
      documentId,
      message: "Documento salvo com sucesso.",
    };
  },
});

// Delete a student document
export const deleteStudentDocument = mutation({
  args: {
    documentId: v.id("studentDocuments"),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);

    if (!document) {
      throw new Error("Documento não encontrado.");
    }

    // Delete from storage
    await ctx.storage.delete(document.storageId);

    // Delete from database
    await ctx.db.delete(args.documentId);

    return {
      message: "Documento excluído com sucesso.",
    };
  },
});

// Get document URL from storage
export const getDocumentUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
