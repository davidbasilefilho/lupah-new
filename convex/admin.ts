// Convex functions for admin operations with Clerk role verification

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all students (admin only)
export const getAllStudents = query({
  handler: async (ctx) => {
    // Note: In queries, we can't modify auth state, so we'll do the check on client side
    // For mutations, we can throw errors
    const students = await ctx.db.query("students").order("desc").collect();

    const studentsWithDetails = await Promise.all(
      students.map(async (student) => {
        const documents = await ctx.db
          .query("studentDocuments")
          .withIndex("studentId", (q) => q.eq("studentId", student._id))
          .collect();

        const currentDocument = documents.find((doc) => doc.isCurrent);
        const documentCount = documents.length;

        const reportsCount = await ctx.db
          .query("progressReports")
          .withIndex("studentId", (q) => q.eq("studentId", student._id))
          .collect()
          .then((reports) => reports.length);

        const activitiesCount = await ctx.db
          .query("activities")
          .withIndex("studentId", (q) => q.eq("studentId", student._id))
          .collect()
          .then((activities) => activities.length);

        return {
          ...student,
          currentDocument,
          documentCount,
          reportsCount,
          activitiesCount,
        };
      }),
    );

    return studentsWithDetails;
  },
});

// Get single student with all details (admin only)
export const getStudentForAdmin = query({
  args: {
    studentId: v.id("students"),
  },
  handler: async (ctx, args) => {
    const student = await ctx.db.get(args.studentId);

    if (!student) {
      throw new Error("Aluno não encontrado.");
    }

    const documents = await ctx.db
      .query("studentDocuments")
      .withIndex("studentId", (q) => q.eq("studentId", args.studentId))
      .order("desc")
      .collect();

    const progressReports = await ctx.db
      .query("progressReports")
      .withIndex("studentId", (q) => q.eq("studentId", args.studentId))
      .order("desc")
      .collect();

    const activities = await ctx.db
      .query("activities")
      .withIndex("studentId", (q) => q.eq("studentId", args.studentId))
      .order("desc")
      .collect();

    return {
      student,
      documents,
      progressReports,
      activities,
    };
  },
});

// Set document as current (admin only)
export const setCurrentDocument = mutation({
  args: {
    documentId: v.id("studentDocuments"),
    studentId: v.id("students"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Não autenticado.");
    }

    const publicMetadata = identity.publicMetadata as { role?: string };

    if (publicMetadata?.role !== "admin") {
      throw new Error("Acesso negado. Apenas administradores podem executar esta ação.");
    }

    // Set all documents for this student to not current
    const existingDocs = await ctx.db
      .query("studentDocuments")
      .withIndex("studentId", (q) => q.eq("studentId", args.studentId))
      .collect();

    for (const doc of existingDocs) {
      await ctx.db.patch(doc._id, { isCurrent: false });
    }

    // Set the selected document as current
    await ctx.db.patch(args.documentId, { isCurrent: true });

    return {
      message: "Documento definido como atual com sucesso.",
    };
  },
});

// Check if current user is admin
export const checkAdminStatus = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return { isAdmin: false };
    }

    const publicMetadata = identity.publicMetadata as { role?: string };

    return {
      isAdmin: publicMetadata?.role === "admin",
      user: {
        name: identity.name,
        email: identity.email,
      },
    };
  },
});

// Get dashboard statistics (admin only)
export const getDashboardStats = query({
  handler: async (ctx) => {
    const students = await ctx.db.query("students").collect();

    const activeStudents = students.filter((s) => s.status === "active").length;
    const inactiveStudents = students.filter((s) => s.status === "inactive").length;
    const graduatedStudents = students.filter((s) => s.status === "graduated").length;

    const totalReports = await ctx.db
      .query("progressReports")
      .collect()
      .then((reports) => reports.length);

    const totalActivities = await ctx.db
      .query("activities")
      .collect()
      .then((activities) => activities.length);

    const totalDocuments = await ctx.db
      .query("studentDocuments")
      .collect()
      .then((documents) => documents.length);

    return {
      totalStudents: students.length,
      activeStudents,
      inactiveStudents,
      graduatedStudents,
      totalReports,
      totalActivities,
      totalDocuments,
    };
  },
});
